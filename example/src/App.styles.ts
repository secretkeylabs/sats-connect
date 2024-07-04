import styled from 'styled-components';

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
  marginBottom: '20px',
});

export const Action = styled.span({
  color: '#ff4d00',
});

export const NetworkSelectionButton = styled.button({
  textAlign: 'center',
  marginBottom: '20px',
});

export const Card = styled.div({
  backgroundColor: 'white',
  color: '#282c34',
  padding: '0 20px 20px 20px',
  marginBottom: '30px',
  borderRadius: '20px',
});

export const Success = styled.div({
  color: 'green',
});

export const Button = styled.button({
  opacity: 0.9,
  padding: '10px 20px',
  minWidth: '130px',
  backgroundColor: '#ff4d00',
  color: 'white',
  fontWeight: 'bold',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  ':hover': {
    opacity: 1,
  },
  ':active': {
    backgroundColor: '#ff6a00',
  },
  ':disabled': {
    opacity: 0.5,
    backgroundColor: '#ff4d00',
    cursor: 'not-allowed',
  },
});

export const Input = styled.input({
  marginTop: '5px',
  width: '300px',
  padding: '10px',
  fontWeight: 'bold',
  fontSize: '1rem',
  ':focus-visible': {
    outline: '#ff4d00 auto 1px',
  },
});

export const H4 = styled.h4({
  marginBlockEnd: '0.5em',
});

export const Code = styled.code({
  fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
});
