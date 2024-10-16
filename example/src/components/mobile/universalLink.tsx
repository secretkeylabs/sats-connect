import { useState } from 'react';
import { Button, Card, Input } from '../../App.styles';

export function MobileUniversalLink() {
  const [url, setUrl] = useState('wallet.xverse.app/explore');

  const link = `https://connect.xverse.app/browser?url=${url}`;

  const handleClick = () => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <h3>Mobile App Universal Link</h3>
      <div>
        If Xverse app is installed, it will open the browser withing the app using the url param
      </div>
      <div>If Xverse app is not installed, it will prompt the user to install the app</div>
      <div style={{ marginTop: 15, marginBottom: 15 }}>
        <div>Url param</div>
        <Input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>
      <div style={{ marginTop: 15, marginBottom: 15 }}>
        <div>Full link</div>
        <div>{link}</div>
      </div>
      <Button onClick={handleClick}>Use Universal Link</Button>
    </Card>
  );
}
