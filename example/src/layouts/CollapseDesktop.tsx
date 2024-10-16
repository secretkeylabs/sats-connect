import { AppShell, Burger, Group, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Logo } from '../App.styles';

export function CollapseDesktop({ children }: React.PropsWithChildren<{}>) {
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
            label: 'Wallet',
            href: '/',
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
        ].map(({ label, href }) => (
          <NavLink key={href} href={href} label={label} />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
