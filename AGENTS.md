When you need to read the projects, read the AGENTS.md file.
When you change the code, update the AGENTS.md file.
If AGENTS.md file does not exist, create it!

---

## Python Project Execution Policy (Recommend)

When operating in a Python environment, the Agent **must strictly follow** the procedure below.

---

### 1. Change to the Project Directory First

* Before executing any command, the Agent **must `cd` into the target project's root directory**.
* All Python-related commands must be executed inside the project directory.
* The Agent must **never** run Python from a global or unrelated directory.

---

### 2. Check for uv Environment Files

In the project root, check for:

* `.venv/`
* `uv.lock`

#### If `.venv` or `uv.lock` does NOT exist

Initialize the uv environment:

```bash
uv init --python=3.11 && uv venv --python=3.11
```

Then activate the virtual environment:

```bash
source .venv/bin/activate
```

---

### 3. If uv Environment Already Exists

If `.venv` and `uv.lock` are present:

Synchronize the environment first:

```bash
uv sync
```

Then activate the virtual environment:

```bash
source .venv/bin/activate
```

---

### 4. Running Python Code

When executing Python scripts:

* The Agent **must use the project-local virtual environment**
* The Agent **must run Python via `uv`**

Example:

```bash
uv run python your_script.py
```

The Agent must **never use the system-level Python interpreter directly**.

---

### 5. Dependency Management Rules

If a required package is missing:

Use:

```bash
uv add package_name
```

If the environment must match `uv.lock`:

```bash
uv sync
```

The Agent must **never use `pip install` directly**.

---

在运行数据获取/训练/批量调用的程序时,先考虑数据量是否较多,使用时间是否较长,先使用小量数据进行测试,然后再跑全量,数据较多时一定要使用`tqdm`或其他方式制作进度条

if you use matplotlib or seaborn to draw the plots, you must use the following configure.

```python
from matplotlib import font_manager
# -------------------- Chinese font --------------------
def set_cn_font():
    candidates = [
        "STHeiti",
    ]
    available = {f.name for f in font_manager.fontManager.ttflist}
    for name in candidates:
        if name in available:
            plt.rcParams["font.sans-serif"] = [name]
            break
    plt.rcParams["axes.unicode_minus"] = False

set_cn_font()
```

尽可能不要在文档和代码中使用绝对路径

每次做出较为复杂的改动时, 调用子智能体进行验收, 问问他你本来要做的任务是否真的完成了, 没有的话就再调用子智能体继续改, 然后再验收, 反复执行直到真的完成所有的任务
