read -p "Enter the name of file: " file
<<comment
if [ -e $file ]
then
 echo Yes $file is found
else
 echo File not found
fi
comment

ls -l $file
#chmod -w $file
#ls -l $file

if [ -w $file ]
then
 echo Yes $file is writable
else
 echo File not writable
fi
