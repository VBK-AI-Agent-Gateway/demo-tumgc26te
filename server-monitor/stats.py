#!/usr/bin/env python3
"""stats.py — 统计一段文本里每个词出现的次数。

用法:
    python3 stats.py "要统计的文本"
    python3 stats.py -f 文件.txt
    echo "要统计的文本" | python3 stats.py
    python3 stats.py -n 10 "只看前 10 个高频词"
    python3 stats.py -c "区分大小写"
    python3 stats.py -j "以 JSON 输出"
"""

import argparse
import re
import sys
from collections import Counter


def tokenize(text: str, case_sensitive: bool = False) -> list:
    """切词：字母/数字/下划线/连字符/英文撇号 组成一个词；汉字按单字计。"""
    pattern = r"[A-Za-z0-9_'\-]+|[\u4e00-\u9fff]"
    words = re.findall(pattern, text, flags=re.UNICODE)
    if not case_sensitive:
        words = [w.lower() for w in words]
    return words


def count_words(text: str, case_sensitive: bool = False) -> Counter:
    return Counter(tokenize(text, case_sensitive))


def render(counter: Counter, top: int = 0, show_bar: bool = True) -> str:
    if not counter:
        return "(文本里没有统计到任何词)"
    items = counter.most_common()
    if top and top > 0:
        items = items[:top]

    width = max(len(w) for w, _ in items)
    numw = len(str(items[0][1]))
    maxc = items[0][1]

    lines = []
    for word, c in items:
        line = f"{word:<{width}}  {c:>{numw}}"
        if show_bar:
            line += "  " + "#" * max(1, round(c / maxc * 30))
        lines.append(line)
    lines.append("----")
    lines.append(f"共 {len(counter)} 个不同词，累计 {sum(counter.values())} 个词次")
    return "\n".join(lines)


def read_text(args) -> str:
    if args.text:
        return " ".join(args.text)
    if args.file:
        with open(args.file, "r", encoding=args.encoding) as fh:
            return fh.read()
    return sys.stdin.read()


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="统计一段文本里每个词出现的次数")
    p.add_argument("text", nargs="*", help="要统计的文本（可省略，改用 -f 或标准输入）")
    p.add_argument("-f", "--file", help="从文件读取文本")
    p.add_argument("-n", "--top", type=int, default=0, help="只显示前 N 个高频词（0=全部）")
    p.add_argument("-c", "--case-sensitive", action="store_true", help="区分大小写（默认不区分）")
    p.add_argument("--no-bar", action="store_true", help="不显示条形图")
    p.add_argument("--encoding", default="utf-8", help="读取文件所用编码（默认 utf-8）")
    p.add_argument("-j", "--json", action="store_true", help="以 JSON 输出")
    args = p.parse_args(argv)

    text = read_text(args)
    if not text.strip():
        print("没有输入文本。用参数、-f 文件或标准输入均可。", file=sys.stderr)
        return 1

    counter = count_words(text, args.case_sensitive)
    if args.json:
        import json
        print(json.dumps(dict(counter.most_common()), ensure_ascii=False, indent=2))
    else:
        print(render(counter, args.top, not args.no_bar))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
