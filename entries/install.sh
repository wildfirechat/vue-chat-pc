#! /bin/sh
desktopPath=/opt/cn.wildfirechat.pcclient/files/entries/applications/cn.wildfirechat.pcclient.desktop
rootDesktop=/root/Desktop
if [ -d $rootDesktop ]; then
  cp $desktopPath $rootDesktop
fi

users=$(users)
for u in $users; do
  dir=/home/$u/Desktop
  cndir=/home/$u/桌面
  if [ -d $dir ]; then
    cp $desktopPath $dir
    chmod 777 $dir/cn.wildfirechat.pcclient.desktop
  fi
  if [ -d $cndir ]; then
    cp $desktopPath $cndir
    chmod 777 $cndir/cn.wildfirechat.pcclient.desktop
  fi
done
