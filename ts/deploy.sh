ng build --prod
rm ../runtime.*.js ../styles.*.css ../polyfills.*.js ../main.*.js
FILES=`echo ./dist/ts/*.*.css ./dist/ts/*.*.js ./dist/ts/*.html`
for i in `echo $FILES`; do cp $i ..;  git add ../`basename $i`; done
