#! /bin/bash

# Install the vsce and all the extensions required by the project.
npm install && npm install -g @vscode/vsce

echo "🔧 Installing Ruby, Jekyll and just-the-docs"
sudo apt-get update
sudo apt-get install -y ruby-full
sudo gem install bundler
sudo gem install --no-document jekyll:4.4.1 just-the-docs:0.10.1