export REACT_APP_MYBASENAME=/cineca/c51
npm run build
rm -rf /Library/WebServer/Documents/cineca/c51/*
cp -r build/* /Library/WebServer/Documents/cineca/c51/
unset REACT_APP_MYBASENAME
