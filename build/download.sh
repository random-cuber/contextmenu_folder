#!/bin/bash

keys_save() {
    echo "$FUNCNAME"
    local url="https://github.com/random-cuber/jquery.hotkeys/archive/master.tar.gz"
    local package="hotkeys.tar.gz"
    wget -q "$url" -O "$package"
    tar x --strip=1 --dir="$keys_dir" --file="$package" \
        --wildcards '*/jquery.hotkeys.js' '*/README.md'
    rm -rf "$package"
}

font_open() {
    echo "$FUNCNAME"
    curl \
        --silent --show-error --fail --output .fontello \
        --form "config=@$font_dir/config.json" \
        ${font_host}
    xdg-open ${font_host}/$(cat .fontello)
}

font_save() {
    echo "$FUNCNAME"
    rm -rf .fontello.src .fontello.zip
    curl \
        --silent --show-error --fail --output .fontello.zip \
        ${font_host}/$(cat .fontello)/get
    unzip -q .fontello.zip -d .fontello.src
    rm -rf "$font_dir"/*
    mv .fontello.src/fontello-*/* "$font_dir"
}

font_clean() {
    echo "$FUNCNAME"
    rm -rf .fontello*
}

location=$(dirname $0) 
base_dir=$(cd "$location/.." && pwd)
asset_dir="$base_dir/assets"

font_host="http://fontello.com"

font_dir="$asset_dir/fontello"
keys_dir="$asset_dir/hotkeys"

mkdir -p "$font_dir" "$keys_dir"

cd "$base_dir"

#keys_save

font_open
font_save
font_clean
