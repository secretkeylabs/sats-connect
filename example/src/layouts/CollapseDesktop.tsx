import { AppShell, Burger, Group, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from 'react-router-dom';
import { Logo } from '../App.styles';

export function CollapseDesktop({ children }: React.PropsWithChildren) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
          <Logo src="/sats-connect.svg" alt="SatsConnect" />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {[
          {
            icon: 'home',
            label: 'Home',
            href: '/',
          },
          {
            icon: 'wallet',
            label: 'Wallet',
            href: '/wallet',
          },
          {
            icon: 'bitcoin',
            label: 'Bitcoin Methods',
            href: '/bitcoin-methods',
          },
          {
            icon: 'stacks',
            label: 'Stacks Methods',
            href: '/stacks-methods',
          },
          {
            icon: 'starknet',
            label: 'Starknet Methods',
            href: '/starknet-methods',
          },
          {
            icon: 'spark',
            label: 'Spark Methods',
            href: '/spark-methods',
          },
          {
            icon: 'mobile-home',
            label: 'Mobile Universal Link',
            href: '/mobile-universal-link',
          },
        ].map(({ label, href }) => (
          <NavLink key={href} to={href} label={label} component={Link} />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
