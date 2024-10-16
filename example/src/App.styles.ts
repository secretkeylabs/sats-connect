import { Button, Card, Input, NativeSelect } from '@mantine/core';
import styled from 'styled-components';
export { Button, Card, Input, NativeSelect };

export const ConnectButtonsContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const Container = styled.div({
  minHeight: '100vh',
  backgroundColor: '#282c34',
  color: '#aeaeae',
  fontSize: 'calc(10px + 1vmin)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const Body = styled.div({
  backgroundColor: 'black',
  minHeight: '100vh',
  width: '100vw',
  maxWidth: '1000px',
  padding: '30px',
  display: 'flex',
  flexDirection: 'column',
});

export const Header = styled.header({
  backgroundColor: 'black',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '50px',
  borderRadius: '20px',
});

export const Logo = styled.img({
  width: '200px',
  padding: 10,
});

export const Action = styled.span({
  color: '#ff4d00',
});

export const NetworkSelectionButton = styled.button({
  textAlign: 'center',
  marginBottom: '20px',
});

export const Success = styled.div({
  color: 'green',
});

export const H4 = styled.h4({
  marginBlockEnd: '0.5em',
});

export const Code = styled.code({
  fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
});
