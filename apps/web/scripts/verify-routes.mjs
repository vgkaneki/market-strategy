import fs from "node:fs";

const routes = [
  ["/", "app/page.tsx"],
  ["/replay", "app/replay/page.tsx"],
  ["/research", "app/research/page.tsx"],
  ["/lce", "app/lce/page.tsx"],
  ["/production", "app/production/page.tsx"]
];

let ok = true;
for (const [route, file] of routes) {
  if (!fs.existsSync(file)) {
    console.error(`Missing route ${route}: ${file}`);
    ok = false;
  } else {
    console.log(`OK ${route} -> ${file}`);
  }
}

if (!ok) process.exit(1);
