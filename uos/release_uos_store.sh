#!/bin/bash
set -e

if [[ $# -eq 0 || $1 == "-h" || $1 == "--help" ]]; then
echo "Usage: ./release_uos_store.sh version arch[amd64, arm64, loongarch64, sw64]."
exit 0
fi

if [ $# -ne 2 ]; then
echo "Invalid parameter count!"
exit 1
fi

if [ "$2" != "amd64" ] && [ "$2" != "arm64" ] && [ "$2" != "loongarch64" ] && [ "$2" != "sw64" ]
then
echo "Invalid parameter! The second parameter must be 'amd64' or 'arm64' or 'loongarch64' or 'sw64'."
exit 1
fi

VERSION=$1
ARCH=$2

if [ "$2" = "loongarch64" ]
then
  BINPATH=linux-loong64-unpacked
elif [ "$2" == "amd64" ]
then
  BINPATH=linux-unpacked
elif [ "$2" == "sw64" ]
then
  BINPATH=linux-sw64-unpacked
else
  BINPATH=linux-${ARCH}-unpacked
fi

if [ "$2" == "sw64" ]
then
  ARCH="sw_64"
fi

sudo rm -rf release

mkdir release
cd release
mkdir cn.wildfirechat.pcclient-${VERSION}
cd cn.wildfirechat.pcclient-${VERSION}
mkdir cn.wildfirechat.pcclient
cd cn.wildfirechat.pcclient
mkdir entries files
cp ../../../info ./

if [ "$2" != "arm64" ]
then
sed -i "s/\"arm64\"/\"${ARCH}\"/" info
fi
sed -i "s/\"version\": \"0.0.1\"/\"version\": \"${VERSION}\"/" info

cd entries
mkdir icons

cd icons
mkdir -p hicolor/16x16/apps/
mkdir -p hicolor/24x24/apps/
mkdir -p hicolor/32x32/apps/
mkdir -p hicolor/48x48/apps/
mkdir -p hicolor/64x64/apps/
mkdir -p hicolor/128x128/apps/
mkdir -p hicolor/256x256/apps/
mkdir -p hicolor/512x512/apps/
mkdir -p hicolor/1024x1024/apps/
cp -af ../../../../../../build/icons/16x16.png hicolor/16x16/apps/cn.wildfirechat.pcclient.png
cp -af ../../../../../../build/icons/24x24.png hicolor/24x24/apps/cn.wildfirechat.pcclient.png
cp -af ../../../../../../build/icons/32x32.png hicolor/32x32/apps/cn.wildfirechat.pcclient.png
cp -af ../../../../../../build/icons/48x48.png hicolor/48x48/apps/cn.wildfirechat.pcclient.png
cp -af ../../../../../../build/icons/64x64.png hicolor/64x64/apps/cn.wildfirechat.pcclient.png
cp -af ../../../../../../build/icons/128x128.png hicolor/128x128/apps/cn.wildfirechat.pcclient.png
cp -af ../../../../../../build/icons/256x256.png hicolor/256x256/apps/cn.wildfirechat.pcclient.png
cp -af ../../../../../../build/icons/512x512.png hicolor/512x512/apps/cn.wildfirechat.pcclient.png
cp -af ../../../../../../build/icons/1024x1024.png hicolor/1024x1024/apps/cn.wildfirechat.pcclient.png
cd ..

mkdir applications
cd applications
cp ../../../../../../entries/applications/cn.wildfirechat.pcclient.desktop ./
cd ../../files
cp -af ../../../../../dist_electron/${BINPATH}/* ./
cd ../../
dh_make --createorig -s -y
cd debian

sed -i 's/^Maintainer.*$/Maintainer: imndx <imndxx@wildirechat.cn>/' control
sed -i 's/^Architecture.*$/Architecture: '"$ARCH"'/' control
sed -i 's/^Version.*$/Version: '"$VERSION"'/' control

sed -i 's/<insert up to 60 chars description>/WF IM PC Client/' control
sed -i 's/<insert long description, indented with spaces>/WF IM PC Client/' control
sed -i 's/<insert the upstream URL, if relevant>/https:\/\/wildfirechat.cn/' control

echo "cn.wildfirechat.pcclient/ /opt/apps" > install
rm *.EX *.ex
cd ..
sudo dpkg-buildpackage -rfakeroot -tc -uc -us -b
cd ..
dpkg-deb -R cn.wildfirechat.pcclient_${VERSION}-1_${ARCH}.deb wfcdeb
rm -rf *.deb
cd wfcdeb
rm -rf usr
sed -i 's/^Version.*$/Version: '"$VERSION"'/' DEBIAN/control
cd ..
dpkg-deb -b wfcdeb cn.wildfirechat.pcclient_${VERSION}_${ARCH}.deb
rm -rf wfcdeb
