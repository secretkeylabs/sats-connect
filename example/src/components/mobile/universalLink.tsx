import { Button, Card, H4 } from '../../App.styles';

export function MobileUniversalLink() {
  const handleClick = () => {
    window.open(
      'https://connect.xverse.app/browser?url=https://wallet.xverse.app/explore',
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <Card>
      <h3>Mobile App Universal Link</h3>
      <div>
        If Xverse app is installed, it will open the browser withing the app using the url param
      </div>
      <div>If Xverse app is not installed, it will prompt the user to install the app</div>
      <Button onClick={handleClick}>Navigate to Xverse Explore</Button>
    </Card>
  );
}
