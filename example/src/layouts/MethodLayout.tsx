import { ActionIcon, Button, Card, Code } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import styled from 'styled-components';
import { ErrorMessage } from '../components/common';

const MethodHeading = styled.h3({
  display: 'flex',
  alignItems: 'center',
  a: { marginLeft: '1rem' },
});

const TwoColGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: '1fr minmax(66%, 2fr)',
  gap: '1rem',
  '& pre': {
    'white-space': 'pre-wrap',
    'word-break': 'break-word',
  },
});

const FormDiv = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginTop: '1rem',
});

interface MethodLayoutProps<T> {
  method: string;
  response: string | null;
  handleRequest: () => void;
  children?: React.ReactNode;
  docsUrl?: string;
  options?: T | null;
  error?: string;
  hideButton?: boolean;
}

export const MethodLayout = <T,>({
  method,
  children,
  docsUrl,
  options,
  response,
  handleRequest,
  error,
  hideButton = false,
}: MethodLayoutProps<T>) => {
  return (
    <Card>
      <MethodHeading>
        {method}
        {docsUrl ? (
          <ActionIcon component="a" href={docsUrl} target="_blank" variant="transparent" size="sm">
            <IconExternalLink />
          </ActionIcon>
        ) : null}
      </MethodHeading>
      <TwoColGrid>
        <div>
          <h4>Options</h4>
          <Code block>{JSON.stringify(options, null, 2)}</Code>
          <FormDiv>
            {children}
            {!hideButton && <Button onClick={handleRequest}>request</Button>}
          </FormDiv>
        </div>
        <div>
          <h4>Response</h4>
          <Code block>{response || 'null'}</Code>
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        </div>
      </TwoColGrid>
    </Card>
  );
};
