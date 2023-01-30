#!/usr/bin/env bash

#
# project release
#
# this script will:
# * auto-increment version 
# * commit new release tag

this_dir=$(dirname $0)

base_dir=$(cd "$this_dir/.." && pwd)

composer_json="$base_dir/composer.json"

version="0.0.0"

version_get() {
    cat "$composer_json" | grep '"version"' | sed -r -e 's/^.*([0-9]+[.][0-9]+[.][0-9]+).*$/\1/'
}

version_put() {
    local version="$1"
    sed -i -r -e 's/(^.*"version".*)([0-9]+[.][0-9]+[.][0-9]+)(.*$)/\1'${version}'\3/' "$composer_json"
}

version_split() {
    local version="$1"
    local array=(${version//'.'/' '})
    version_major=${array[0]}
    version_minor=${array[1]}
    version_micro=${array[2]}
}

version_build() {
    echo "${version_major}.${version_minor}.${version_micro}"
}

version_increment() {
    version_micro=$(( $version_micro + 1 ))
}

version_update() {
    version=$(version_get)
    echo "version past=$version"
    version_split "$version"
    version_increment
    version=$(version_build)
    echo "version next=$version"
    version_put "$version"
}

project_release() {
    cd "$base_dir"
    echo "// commit $(pwd)"
    git add --all  :/
    git status
    message=$(git status --short)
    git commit --message "$message"
    tag="$version"
    git tag -a "$tag" -m "release version $version"
    git push
    git push --tags
}

###

version_update

project_release
