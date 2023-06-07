echo "Generating"
for elem in "$@"
do
  npx typescript-json-schema "src/schemas/**/*.ts" $elem --required > "src/schemas/$elem.json"
  echo "src/schemas/$elem created"
done
echo "Done"
