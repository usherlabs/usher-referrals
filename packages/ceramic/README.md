# Ceramic

This package provides a comprehensive guide for setting up a Ceramic node for both development and production environments on a Linux server. The guide includes the necessary configuration files, Docker Compose files, and Nginx server configuration for both environments.

## Prerequisites

Before you begin, ensure that you have:

- Access to a Linux server with root access
- Command-line interface

## File Structure

The package contains the following files and directories:

- **`.env.example`** - Example file containing environment variables for configuration.
- **`development-server`** - Directory containing files for the development environment setup.
- **`production-server`** - Directory containing files for the production environment setup.

## Installation and Configuration

Follow these steps to install and configure the Ceramic node:

1. **Access your Linux server** and update the package list by running:

```
sudo apt update
```

2. **Install Node Version Manager (nvm)** by following the instructions on the **[nvm GitHub repository](https://github.com/nvm-sh/nvm#installing-and-updating)**.
3. **Install Node.js and Yarn** by running:

```
nvm install node
npm install -g pnpm
```

4. **Install Ceramic CLI** by running:

```
pnpm i -g @ceramicnetwork/cli
```

5. **Install Golang** by following the instructions on the **[official Golang website](https://golang.org/doc/install)**.
6. **Build go-ipfs with additional plugins** by following the instructions on the **[go-ipfs GitHub repository](https://github.com/ipfs/go-ipfs#build-from-source)**.
7. **Install Docker and Docker Compose** by following the instructions on the **[official Docker documentation](https://docs.docker.com/engine/install/ubuntu/)** and **[Docker Compose documentation](https://docs.docker.com/compose/install/)**.
8. **Install and configure Nginx** by running:

```
sudo apt install nginx
```

Then, follow the instructions on the **[official Nginx documentation](https://nginx.org/en/docs/beginners_guide.html)** to set up firewall rules.

9. **Transfer files to your Linux server** by copying the relevant files from the **`development-server`** or **`production-server`** directory on this repository to your Linux server. Create a directory named **`ceramic`** in your home folder (**`~/ceramic`**) and place the files there. For example, you can use the **`scp`** command to copy the files from your local machine to the server:

```
scp -r development-server/* user@your_server_ip:~/ceramic
```

10. **Configure Ceramic daemon and Docker Compose files** by following the provided configuration files in the **`development-server`** and **`production-server`** directories.
11. **Update environment variables** in **`.env.example`** as needed, replacing placeholders (e.g., **`mydomain.com`**, **`eg_infura_endpoint`**) with appropriate values.
12. **Set up Nginx for Ceramic** by copying the **`ceramic-nginx.conf`** file from the respective environment directory to the Nginx configuration directory and creating a symlink to enable the configuration:

```
sudo cp ~/ceramic/ceramic-nginx.conf /etc/nginx/sites-available/ceramic
sudo ln -s /etc/nginx/sites-available/ceramic /etc/nginx/sites-enabled/
```

13. **Install Certbot and obtain SSL certificates** by following the instructions on the **[official Certbot website](https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx)** for your domain.
14. **Automate SSL certificate renewal** by setting up a daily cron job as instructed in the **[official Certbot documentation](https://certbot.eff.org/docs/using.html#automated-renewals)**.
15. **Restart Nginx** to apply the changes and enable the Ceramic configuration:

```
sudo systemctl restart nginx
```

16. **Test your Ceramic node** by accessing it via your domain (e.g., **`https://mydomain.com`**). You should see a response indicating that the Ceramic node is running.

That's it! You've now set up a Ceramic node for development or production environments on your Linux server. Remember to periodically update your packages and monitor the server to ensure it's running smoothly.
