const fs = require("fs");
const path = require("path");

function printTree(rootPath, options = {}) {
    const {
        maxDepth = Infinity,
        showFiles = true
    } = options;

    if (!fs.existsSync(rootPath)) {
        console.log(`Path does not exist: ${rootPath}`);
        return;
    }

    console.log(path.resolve(rootPath));

    function walk(currentPath, prefix = "", depth = 0) {
        if (depth >= maxDepth) return;

        let items = fs.readdirSync(currentPath)
            .map(name => ({
                name,
                fullPath: path.join(currentPath, name),
                isDir: fs.statSync(path.join(currentPath, name)).isDirectory()
            }))
            .filter(item => showFiles || item.isDir)
            .sort((a, b) => {
                // папки сверху
                if (a.isDir !== b.isDir) {
                    return a.isDir ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });

        items.forEach((item, index) => {
            const isLast = index === items.length - 1;

            const branch = isLast ? "└── " : "├── ";

            console.log(prefix + branch + item.name);

            if (item.isDir) {
                const extension = isLast ? "    " : "│   ";
                walk(
                    item.fullPath,
                    prefix + extension,
                    depth + 1
                );
            }
        });
    }

    walk(rootPath);
}


// ===== пример =====

printTree("./shared", {
    maxDepth: 4,
    showFiles: true
});