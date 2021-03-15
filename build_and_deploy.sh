export REACT_APP_MYBASENAME=/react1
npm run build
rm -rf /Library/WebServer/Documents/react1/*
cp -r build/* /Library/WebServer/Documents/react1/
unset REACT_APP_MYBASENAME

