import { useState } from 'react';
import { Button, Card, Input } from '../../App.styles';

export function MobileUniversalLink() {
  const [url, setUrl] = useState(
    'https://connect.xverse.app/browser?url=wallet.xverse.app/explore',
  );

  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <h3>Mobile App Universal Link</h3>
      <div>
        If Xverse app is installed, it will open the browser withing the app using the url param
      </div>
      <div>If Xverse app is not installed, it will prompt the user to install the app</div>
      <div style={{ marginTop: 15, marginBottom: 15 }}>
        <div>url param</div>
        <Input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>
      <Button onClick={handleClick}>Navigate to Xverse Explore</Button>
    </Card>
  );
}
