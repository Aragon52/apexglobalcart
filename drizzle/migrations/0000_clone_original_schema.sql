CREATE FUNCTION public.count_other_active_sessions() RETURNS integer
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$
  select count(*)::int
  from auth.sessions s
  where s.user_id = auth.uid()
    and s.id::text is distinct from (auth.jwt() ->> 'session_id')
    and (s.not_after is null or s.not_after > now());
$$;

CREATE TABLE public.admin_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    admin_id text, admin_email text, action text, target text, details jsonb, ip_address text,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.broadcast_notifications (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    title text, message text, active boolean DEFAULT true, created_at timestamp with time zone DEFAULT now(),
    label text, department text, is_archived boolean DEFAULT false, broadcast_date timestamp with time zone DEFAULT now()
);
CREATE TABLE public.categories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    name text, icon text, created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.users (
    id uuid NOT NULL PRIMARY KEY, email text, role text DEFAULT 'reseller'::text, first_name text, last_name text,
    created_at timestamp with time zone DEFAULT now(), phone text, avatar_url text
);
CREATE TABLE public.sla_admins (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    name text, email text UNIQUE, account_id text UNIQUE, phone text, status text DEFAULT 'Active'::text,
    permissions text[], created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.sla_staff (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    name text, email text UNIQUE, username text, referral_id text UNIQUE,
    created_by_admin_id uuid REFERENCES public.sla_admins(id), staff_id text, phone text,
    department text DEFAULT 'Unassigned'::text, status text DEFAULT 'Active'::text,
    created_at timestamp with time zone DEFAULT now(), permissions text[] DEFAULT '{}'::text[]
);

CREATE FUNCTION public.is_admin(user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users u WHERE u.id = user_id AND u.role IN ('admin', 'owner'))
      OR EXISTS (SELECT 1 FROM public.sla_admins s WHERE s.id = user_id);
END;
$$;
CREATE FUNCTION public.is_owner(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (select 1 from public.users where id = _user_id and role = 'owner');
$$;
CREATE FUNCTION public.is_staff(user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users u WHERE u.id = user_id AND u.role = 'staff')
      OR EXISTS (SELECT 1 FROM public.sla_staff s WHERE s.id = user_id);
END;
$$;
CREATE FUNCTION public.is_sla_user(user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN public.is_admin(user_id) OR public.is_staff(user_id);
END;
$$;

CREATE FUNCTION public.list_admin_login_history(_limit integer DEFAULT 200) RETURNS TABLE(id uuid, user_id uuid, email text, role text, action text, ip text, created_at timestamp with time zone)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$
begin
  if not public.is_owner(auth.uid()) then raise exception 'forbidden'; end if;
  return query
  select a.id, u.id, u.email::text,
    coalesce(pu.role, case when sa.id is not null then 'admin' when ss.id is not null then 'staff' end)::text,
    (a.payload ->> 'action')::text, a.ip_address::text, a.created_at
  from auth.audit_log_entries a
  join auth.users u on u.id::text = (a.payload ->> 'actor_id')
  left join public.users pu on pu.id = u.id
  left join public.sla_admins sa on sa.id = u.id
  left join public.sla_staff ss on ss.id = u.id
  where (a.payload ->> 'action') in ('login','logout','user_signedup','token_revoked','user_recovery_requested','user_updated_password')
    and (pu.role in ('owner','admin','staff') or sa.id is not null or ss.id is not null)
  order by a.created_at desc
  limit least(greatest(_limit, 1), 1000);
end; $$;

CREATE FUNCTION public.list_admin_sessions() RETURNS TABLE(session_id uuid, user_id uuid, email text, role text, ip text, user_agent text, created_at timestamp with time zone, last_active_at timestamp with time zone, is_current boolean)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$
begin
  if not public.is_owner(auth.uid()) then raise exception 'forbidden'; end if;
  return query
  select s.id, s.user_id, u.email::text,
    coalesce(pu.role, case when sa.id is not null then 'admin' when ss.id is not null then 'staff' end)::text,
    host(s.ip)::text, s.user_agent::text, s.created_at,
    coalesce(s.refreshed_at::timestamptz, s.updated_at, s.created_at),
    (s.id::text = (auth.jwt() ->> 'session_id'))
  from auth.sessions s
  join auth.users u on u.id = s.user_id
  left join public.users pu on pu.id = s.user_id
  left join public.sla_admins sa on sa.id = s.user_id
  left join public.sla_staff ss on ss.id = s.user_id
  where (pu.role in ('owner','admin','staff') or sa.id is not null or ss.id is not null)
    and (s.not_after is null or s.not_after > now())
  order by 8 desc;
end; $$;

CREATE FUNCTION public.revoke_admin_session(_session_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$
begin
  if not public.is_owner(auth.uid()) then raise exception 'forbidden'; end if;
  delete from auth.sessions where id = _session_id;
end; $$;

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.reseller_profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    email text, first_name text, last_name text, shop_name text, shop_slug text,
    member_of_admin_id uuid REFERENCES public.sla_admins(id),
    referred_by_staff_id uuid REFERENCES public.sla_staff(id),
    referral_code text, referral_id text, verified boolean DEFAULT false,
    balance numeric DEFAULT 0.00, pending_balance numeric DEFAULT 0.00, unpicked_balance numeric DEFAULT 0.00,
    total_deposits numeric DEFAULT 0.00, total_withdrawals numeric DEFAULT 0.00, total_earnings numeric DEFAULT 0.00,
    total_orders integer DEFAULT 0, level text DEFAULT 'VIP 1'::text, credit_score numeric DEFAULT 100,
    star_rating numeric DEFAULT 5.0, product_limit integer DEFAULT 500, payment_method text, usdc_address text,
    fcm_tokens text[], last_token_update timestamp with time zone, reseller_id integer,
    registration_date timestamp with time zone DEFAULT now(), created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(), bank_info text, profile_picture text, phone text,
    shop_logo text, shop_hero_banner text, store_theme text DEFAULT 'minimal'::text
);
CREATE TABLE public.deposit_requests (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "resellerDocId" uuid REFERENCES public.reseller_profiles(id), amount numeric, status text DEFAULT 'pending'::text,
    screenshot text, "createdAt" timestamp with time zone DEFAULT now(), remark text
);
CREATE TABLE public.withdrawal_requests (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "resellerDocId" uuid REFERENCES public.reseller_profiles(id), amount numeric, status text DEFAULT 'pending'::text,
    method text, account_info text, "createdAt" timestamp with time zone DEFAULT now(), remark text
);
CREATE TABLE public.products (
    id text NOT NULL PRIMARY KEY, sku text, name text, price numeric, original_price numeric, image text, rating numeric,
    category text, badge text, description text, seller text, in_stock boolean DEFAULT true, stock integer DEFAULT 0,
    specifications jsonb, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.orders (
    id text NOT NULL PRIMARY KEY, orderid text, order_number text, user_id text,
    reseller_id uuid REFERENCES public.reseller_profiles(id), human_reseller_id text, reseller_name text, resellername text,
    resellernumericid integer, profile_name text, profilename text, customer_name text, customername text,
    customer_email text, customer_phone text, shipping_address text, staff_username text, admin_username text,
    referral_id text, referred_by_staff_id text, member_of_admin_id text, total_amount numeric, total_cost numeric,
    service_cost numeric, profit numeric, profits numeric, subtotal numeric, tax numeric, shipping numeric,
    status text DEFAULT 'Pending'::text, focused boolean DEFAULT false, items_count integer, products_count integer,
    order_items jsonb, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone, picked_up_at timestamp with time zone
);
CREATE TABLE public.order_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    order_id text REFERENCES public.orders(id) ON DELETE CASCADE, product_id text REFERENCES public.products(id),
    name text, image text, cost numeric, price numeric, price_at_time numeric, qty integer, quantity integer,
    adjustedprice numeric, created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.reseller_chat_sessions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    reseller_id uuid REFERENCES public.reseller_profiles(id), customer_id text, customer_name text, reseller_name text,
    is_online boolean DEFAULT false, is_pinned boolean DEFAULT false, last_message_at timestamp with time zone DEFAULT now(),
    unread_count integer DEFAULT 0, created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.reseller_chat_messages (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    session_id uuid REFERENCES public.reseller_chat_sessions(id) ON DELETE CASCADE, sender text, content text,
    image_url text, is_read boolean DEFAULT false, created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.reseller_notifications (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    reseller_id uuid REFERENCES public.reseller_profiles(id), title text, content text, type text,
    read boolean DEFAULT false, created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.reseller_product_selection (
    reseller_id uuid NOT NULL REFERENCES public.reseller_profiles(id) ON DELETE CASCADE,
    product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (reseller_id, product_id)
);
CREATE TABLE public.retail_shops (
    id uuid NOT NULL PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    reseller_id integer, shop_name text, shop_slug text, level text DEFAULT 'VIP-0'::text, product_limit integer DEFAULT 20,
    star_rating numeric DEFAULT 2.0, credit_score numeric DEFAULT 100, created_at timestamp with time zone DEFAULT now(),
    is_suspended boolean DEFAULT false, shop_logo text, shop_hero_banner text, store_theme text
);
CREATE TABLE public.reviews (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    product_id text REFERENCES public.products(id) ON DELETE CASCADE, user_name text, rating integer, comment text,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.seasonal_themes (
    id text DEFAULT (gen_random_uuid())::text NOT NULL PRIMARY KEY, slug text, is_active boolean DEFAULT false,
    decorations jsonb, created_at timestamp with time zone DEFAULT now(), name text,
    template text DEFAULT 'neutral'::text NOT NULL, banner_message text, cta_label text, cta_path text,
    show_on_reseller boolean DEFAULT true NOT NULL, show_on_storefront boolean DEFAULT true NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.support_sessions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    reseller_id uuid REFERENCES public.reseller_profiles(id), customer_name text, is_online boolean DEFAULT false,
    unread_count integer DEFAULT 0, last_message_at timestamp with time zone DEFAULT now(), created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.support_messages (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    session_id uuid REFERENCES public.support_sessions(id) ON DELETE CASCADE, sender text, content text, image_url text,
    is_read boolean DEFAULT false, created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.system_settings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    key text UNIQUE, value text, category text, label text, created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.virtual_customer_profiles (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    name text, email text, phone text, address text, created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX admin_audit_logs_created_at_desc_idx ON public.admin_audit_logs USING btree (created_at DESC);
CREATE TRIGGER update_seasonal_themes_updated_at BEFORE UPDATE ON public.seasonal_themes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_product_selection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retail_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories write" ON public.categories USING (public.is_sla_user(auth.uid()));
CREATE POLICY "Admin audit logs insert" ON public.admin_audit_logs FOR INSERT WITH CHECK (public.is_sla_user(auth.uid()));
CREATE POLICY "Admin audit logs read" ON public.admin_audit_logs FOR SELECT USING (public.is_sla_user(auth.uid()));
CREATE POLICY "Allow admins to manage all reseller profiles" ON public.reseller_profiles USING (public.is_admin(auth.uid()));
CREATE POLICY "Allow admins to manage sla admins" ON public.sla_admins USING (public.is_admin(auth.uid()));
CREATE POLICY "Allow admins to manage sla staff" ON public.sla_staff USING (public.is_admin(auth.uid()));
CREATE POLICY "Allow admins to manage users" ON public.users USING (public.is_admin(auth.uid()));
CREATE POLICY "Allow admins/staff to delete reviews" ON public.reviews USING (public.is_sla_user(auth.uid()));
CREATE POLICY "Allow admins/staff to manage products" ON public.products USING (public.is_sla_user(auth.uid()));
CREATE POLICY "Allow admins/staff to manage retail shops" ON public.retail_shops USING (public.is_sla_user(auth.uid()));
CREATE POLICY "Allow authenticated users to create reviews" ON public.reviews FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "Allow authenticated users to read profiles" ON public.users FOR SELECT USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Allow authenticated users to view sla admins" ON public.sla_admins FOR SELECT USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Allow authenticated users to view sla staff" ON public.sla_staff FOR SELECT USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Allow individuals to insert their own profile" ON public.users FOR INSERT WITH CHECK ((auth.uid() = id));
CREATE POLICY "Allow individuals to insert their own retail shop" ON public.retail_shops FOR INSERT WITH CHECK ((auth.uid() = id));
CREATE POLICY "Allow individuals to update their own profile" ON public.users FOR UPDATE USING ((auth.uid() = id));
CREATE POLICY "Allow individuals to update their retail shop" ON public.retail_shops FOR UPDATE USING (((auth.uid() = id) OR public.is_sla_user(auth.uid())));
CREATE POLICY "Allow public read product selections" ON public.reseller_product_selection FOR SELECT USING (true);
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public/authenticated read retail shops" ON public.retail_shops FOR SELECT USING (true);
CREATE POLICY "Allow public/authenticated read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow resellers to view and modify their selections" ON public.reseller_product_selection USING (((reseller_id = auth.uid()) OR public.is_sla_user(auth.uid())));
CREATE POLICY "Allow users to insert order items" ON public.order_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1 FROM public.orders o WHERE ((o.id = order_items.order_id) AND ((o.reseller_id = auth.uid()) OR public.is_sla_user(auth.uid()))))));
CREATE POLICY "Allow users to insert own reseller profile" ON public.reseller_profiles FOR INSERT WITH CHECK ((auth.uid() = id));
CREATE POLICY "Allow users to read reseller profile" ON public.reseller_profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update own reseller profile" ON public.reseller_profiles FOR UPDATE USING (((auth.uid() = id) OR public.is_sla_user(auth.uid())));
CREATE POLICY "Allow users to update/insert their own orders" ON public.orders USING (((reseller_id = auth.uid()) OR public.is_sla_user(auth.uid())));
CREATE POLICY "Allow users to view order items" ON public.order_items FOR SELECT USING ((EXISTS ( SELECT 1 FROM public.orders o WHERE ((o.id = order_items.order_id) AND ((o.reseller_id = auth.uid()) OR public.is_sla_user(auth.uid()))))));
CREATE POLICY "Allow users to view their own orders" ON public.orders FOR SELECT USING (((reseller_id = auth.uid()) OR public.is_sla_user(auth.uid())));
CREATE POLICY "Broadcast notifications admin" ON public.broadcast_notifications USING (public.is_sla_user(auth.uid()));
CREATE POLICY "Broadcast notifications read" ON public.broadcast_notifications FOR SELECT USING (true);
CREATE POLICY "Chat messages access" ON public.reseller_chat_messages USING ((EXISTS ( SELECT 1 FROM public.reseller_chat_sessions s WHERE ((s.id = reseller_chat_messages.session_id) AND ((s.reseller_id = auth.uid()) OR public.is_sla_user(auth.uid()))))));
CREATE POLICY "Chat sessions access" ON public.reseller_chat_sessions USING (((reseller_id = auth.uid()) OR public.is_sla_user(auth.uid())));
CREATE POLICY "Deposit requests access" ON public.deposit_requests USING ((("resellerDocId" = auth.uid()) OR public.is_sla_user(auth.uid())));
CREATE POLICY "Reseller notifications" ON public.reseller_notifications USING (((reseller_id = auth.uid()) OR public.is_sla_user(auth.uid())));
CREATE POLICY "Seasonal themes read" ON public.seasonal_themes FOR SELECT USING (true);
CREATE POLICY "Seasonal themes write" ON public.seasonal_themes USING (public.is_admin(auth.uid()));
CREATE POLICY "Support messages access" ON public.support_messages USING ((EXISTS ( SELECT 1 FROM public.support_sessions s WHERE ((s.id = support_messages.session_id) AND ((s.reseller_id = auth.uid()) OR public.is_sla_user(auth.uid()))))));
CREATE POLICY "Support sessions access" ON public.support_sessions USING (((reseller_id = auth.uid()) OR public.is_sla_user(auth.uid())));
CREATE POLICY "System settings read" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "System settings write" ON public.system_settings USING (public.is_admin(auth.uid()));
CREATE POLICY "Virtual customer modify" ON public.virtual_customer_profiles USING (public.is_sla_user(auth.uid()));
CREATE POLICY "Virtual customer read" ON public.virtual_customer_profiles FOR SELECT USING (true);
CREATE POLICY "Withdrawal requests access" ON public.withdrawal_requests USING ((("resellerDocId" = auth.uid()) OR public.is_sla_user(auth.uid())));

ALTER PUBLICATION supabase_realtime ADD TABLE public.users, public.reseller_profiles, public.retail_shops, public.orders, public.reseller_chat_sessions, public.reseller_chat_messages, public.support_sessions, public.support_messages, public.broadcast_notifications;

CREATE POLICY "Uploads read" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Uploads insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Uploads update" ON storage.objects FOR UPDATE USING (bucket_id = 'uploads') WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Uploads delete" ON storage.objects FOR DELETE USING (bucket_id = 'uploads');