import { render, screen } from '@testing-library/react'
import Navbar from './Navbar'
import { NextIntlClientProvider } from 'next-intl'

// Mock next-intl translations
const mockMessages = {
  nav: {
    home: 'Home',
    properties: 'Properties',
    contact: 'Contact'
  }
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  usePathname: () => '/en'
}))

describe('Navbar Component', () => {
  it('renders the brand logo', () => {
    render(
      <NextIntlClientProvider locale="en" messages={mockMessages}>
        <Navbar />
      </NextIntlClientProvider>
    )
    
    expect(screen.getByText('MIRA')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(
      <NextIntlClientProvider locale="en" messages={mockMessages}>
        <Navbar />
      </NextIntlClientProvider>
    )
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Properties')).toBeInTheDocument()
  })

  it('does not contain market switcher elements', () => {
    render(
      <NextIntlClientProvider locale="en" messages={mockMessages}>
        <Navbar />
      </NextIntlClientProvider>
    )
    
    // Should NOT contain UK or market-related text
    const navbarText = screen.getByRole('navigation').textContent || ''
    expect(navbarText).not.toMatch(/UK|market|British|service/i)
  })

  it('has language switcher component', () => {
    render(
      <NextIntlClientProvider locale="en" messages={mockMessages}>
        <Navbar />
      </NextIntlClientProvider>
    )
    
    // Language switcher should be present
    expect(screen.getByRole('navigation')).toContainElement(
      screen.getByTestId('language-switcher')
    )
  })
})