echo "Building wasm module..."
if [ -d "pkg" ]; then
  rm -rf pkg
fi
mkdir pkg

wasm-pack build --dev --no-typescript --out-dir "./pkg" --out-name "ext" --target web
rm -f pkg/js/wasm/.gitignore
rm -f pkg/js/wasm/package.json

cp -r ./js/* ./pkg

ls -l pkg/

if [ "$(ls -A pkg)" ]; then
    rm -f chrome.zip
    (cd pkg && zip -rq ../chrome.zip . -x manifest.json) && \
    echo "Chrome package: chrome.zip"
else
    echo "No files found in pkg directory to zip."
fi
