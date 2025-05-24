# Zed Codespace

Deploy an EC2 instance for remote development with Zed.

## Run

```bash
npm install
npm run cdk:deploy
```

## Configure ssh

Update HostName with the Elastic Ip.

`$HOME/.ssh/config`

```
Host zed-codespace
  ForwardAgent yes
  ForwardX11 yes
  User ec2-user
  HostName <elastic-ip>
```

## Configure zed

`$HOME/.config/zed/settings.json`

```json
{
  "ssh_connections": [
    {
      "host": "zed-codespace",
      "projects": [
        {
          "paths": ["~/workspaces"]
        }
      ],
      "nickname": "zed-codespace",
      "port_forwards": [
        {
          "local_port": 3000,
          "remote_port": 3000
        }
      ]
    }
  ]
  // ...
}
```

## Stop / Start

```bash
npm run ec2:stop
npm run ec2:start
```

## Destroy

```bash
npm run cdk:destroy
```
