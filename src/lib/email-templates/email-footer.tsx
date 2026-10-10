import * as React from 'react'
import { Hr, Img, Link, Section, Text } from '@react-email/components'

// Shared branded footer for every email: logo, support contacts and address.
const LOGO_URL = 'https://apexglobalonlineshop.com/icons/icon-192.png'
const SITE_URL = 'https://apexglobalonlineshop.com'

export const EmailFooter = () => (
  <Section style={wrap}>
    <Hr style={hr} />
    <Img src={LOGO_URL} width="48" height="48" alt="Apex Global Cart" style={logo} />
    <Text style={brand}>Apex Global Cart</Text>
    <Text style={line}>
      Support:{' '}
      <Link href="mailto:support@apexglobalonlineshop.com" style={link}>
        support@apexglobalonlineshop.com
      </Link>
    </Text>
    <Text style={line}>Hotline: +65 6800 4200 (24/7)</Text>
    <Text style={line}>
      Apex Global Cart International Pte. Ltd., 30 Cecil Street #21-05, Prudential Tower,
      Singapore 048716
    </Text>
    <Text style={line}>
      <Link href={SITE_URL} style={link}>apexglobalonlineshop.com</Link>
    </Text>
  </Section>
)

const wrap = { marginTop: '32px', textAlign: 'center' as const }
const hr = { borderColor: '#e5e7eb', margin: '0 0 20px' }
const logo = { margin: '0 auto 8px', borderRadius: '10px' }
const brand = { fontSize: '14px', fontWeight: 'bold' as const, color: '#1e3a8a', margin: '0 0 8px' }
const line = { fontSize: '12px', color: '#6b7280', lineHeight: '1.5', margin: '0 0 4px' }
const link = { color: '#2563eb', textDecoration: 'none' }
