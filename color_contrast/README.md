## Install
We used the NLopt package from: https://nlopt.readthedocs.io/en/latest/. You need install it in order to compile our solver.

Once you installed package, use following command to compile solver.c:
```bash
$ cc solver.c -o solver -lnlopt -lm
```

## Usage
1. Download the graph data from ColorContrast page.

2. Run the solver with the graph data, The solver will output a color file which has the same name as the graph data file with the prefix "out_":
```bash
$ solver <file_name>
```

3. Upload the color file to ColorContrast page.