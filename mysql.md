# Mysql

## 概述

MySQL 是数据库管理系统，只需要简单的 SQL 语句就可以操作数据库。数据库的底层离不开 IO 流。

### 常见的数据库管理系统

| 数据库 | 特点 |
|--------|------|
| Oracle | 重量级，传统行业使用较多：银行、政府 |
| MySQL | 轻量级，互联网行业使用较多 |
| MS SQL Server | 支持标准 SQL 的数据库管理系统 |

---

## 建表规范

- 必须拥有自增（`AUTO_INCREMENT`）主键 `id`，类型为 `bigint`（可视情况改变）并且是 `UNSIGNED`（无符号）
- 必须使用 `utf8mb4` 字符集，因为在 MySQL 中 `utf8` 并非真正的"UTF-8"
- 每个字段必须拥有中文注释
- 必须拥有 `create_time` 和 `update_time` 字段

```sql
create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
update_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

- （考虑）字段尽量定义 `NOT NULL`，因为过多的 `NULL` 会影响性能

---

## SQL、DB、DBMS 分别是什么？

- **DB**：DataBase（数据库），数据库实际上在硬盘上以文件的形式存在
- **DBMS**：DataBase Management System（数据库管理系统）
- **SQL**：结构化查询语言，是一门标准通用的语言，标准的 SQL 适合于所有的数据库产品

```
程序员 --编写--> SQL --> DBMS 编译执行 --> 操作 DB
```

### 什么是表（table）

一个表有行和列：
- **行**：数据（data）
- **列**：字段（column）

表是数据库的基本组成单元，所有的数据都以表格的形式组织，目的是可读性强。每一个字段都应该包括：字段名 + 数据类型 + 相当的约束。

---

## SQL 分类

| 类型 | 全称 | 说明 |
|------|------|------|
| DQL | Data Query Language（数据查询语言） | 凡是 `SELECT` 语句都是 DQL |
| DML | Data Manipulation Language（数据操作语言） | `INSERT`、`DELETE`、`UPDATE` |
| DDL | Data Definition Language（数据定义语言） | `CREATE`、`DROP`、`ALTER` |
| TCL | Transaction Control Language（事务控制语言） | `COMMIT`、`ROLLBACK` |
| DCL | Data Control Language（数据控制语言） | `GRANT`（授权）、`REVOKE`（撤销权限） |

---

## MySQL 数据类型

### 数值类型

> `m` 指的是最大的显示宽度，最大有效显示宽度是 255。显示宽度与存储大小或类型的包含的值的范围无关。显示宽度并不限制可以在列内保存的值的范围，也不限制超过列的指定宽度的值的显示，但是不足显示宽度的时候会补上指定的值。

### 日期和时间类型

> Java 中映射可以使用 `java.sql.Date`，它继承了 `java.util.Date`，`sql.Date` 会更贴合 MySQL 的格式。

| 类型 | 说明 |
|------|------|
| `DATE` | 日期，支持范围 `1000-01-01` ~ `9999-12-31`，格式 `YYYY-MM-DD` |
| `DATETIME(n)` | 日期时间，`n` 最大 6（微秒），范围 `1000-01-01 00:00:00` ~ `9999-12-31 23:59:59` |
| `TIMESTAMP` | 时间戳，范围 `1970-01-01 00:00:00` ~ `2037` 年 |
| `TIME` | 时间，范围 `-838:59:59` ~ `838:59:59`，格式 `HH:MM:SS` |
| `YEAR[2/4]` | 年，两位或四位格式，默认四位，范围 `1901` ~ `2155` 和 `0000` |

#### TIMESTAMP 特性

- 用于 `INSERT` 和 `UPDATE` 操作时记日期和时间
- 如果不分配值，表中的第一个 `TIMESTAMP` 列自动设置为最新操作的日期和时间
- 也可以通过分配一个 `NULL` 值将 `TIMESTAMP` 设置为当前的日期和时间
- 返回值显示为 `YYYY-MM-DD HH:MM:SS` 格式的字符串，显示宽度固定为 19 个字符

### 字符串类型

| 类型 | 说明 |
|------|------|
| `CHAR(M)` | 固定长度字符串，M 范围 0~255 字符，取出时尾部空格会被删除 |
| `VARCHAR(M)` | 可变字符串，M 范围 0~65532 字节，MySQL 5.0 后 M 表示存储字符数 |
| `TEXT` | 最大长度为 65535（2¹⁶ - 1）字符 |

> **提示**：反引号 `` ` `` 用来区分普通字符和保留字，如果使用了保留字作为字段，需要使用反引号区分。

---

## 排序规则

### `utf8mb4_0900_ai_ci`（MySQL 8.0 默认）

- `utf8mb4`：UTF-8 编码方案，每个字符最多占 4 个字节
- `0900`：Unicode 校对算法版本
- `ai`：口音不敏感（Accent Insensitive）
- `ci`：不区分大小写（Case Insensitive）

### `utf8mb4_unicode_ci`

基于标准的 Unicode 来排序和比较，能够在各种语言之间精确排序：

- 区分大小写
- 支持多语言（包括表情符号）
- 考虑语言特性排序（如德语 `ä`, `ö`, `ü`）
- 重音符号与无重音符号视为相等（如 `é` 和 `e`）
- 将数字放在字母之后排序
- 忽略尾部空格

### `utf8mb4_general_ci`（MySQL 5.7 默认）

- 不区分大小写（`A` 和 `a` 视为相等）
- 忽略重音符号、变音符号（如 `café` 和 `cafe` 视为相等）

### `utf8mb4_general_cs`

- 区分大小写（`A` 和 `a` 视为不同）
- 考虑重音符号、变音符号差异

---

## 建表

> **规范**：数据库名、表名、字段名都不允许使用大写。

### 创建表

```sql
DROP TABLE IF EXISTS `test1`;

CREATE TABLE test1 (
    `t1_no` INT(4) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(10) NOT NULL
);

CREATE TABLE test2 (
    `t2_no` INT(4) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `age` INT(3) NOT NULL,
    `t1_no` INT(4) NOT NULL,
    FOREIGN KEY (t1_no) REFERENCES test1(t1_no)
);
```

### 约束关键字

| 关键字 | 说明 |
|--------|------|
| `PRIMARY KEY` | 主键 |
| `AUTO_INCREMENT` | 自增长 |
| `FOREIGN KEY` | 外键 |
| `UNIQUE INDEX` | 唯一索引 |

### 外键使用示例

```sql
FOREIGN KEY <当前表要作为外键的字段> REFERENCES 被依赖的表名 <被依赖表的主键>
```

### 唯一索引使用示例

```sql
-- ASC 升序；DESC 降序
UNIQUE INDEX 索引名 (`字段名` ASC)

-- 例如：
UNIQUE INDEX modelName (`model_name`)
```

---

## 修改表

### 增加字段

```sql
-- 默认添加在最后
ALTER TABLE `表名` ADD `字段名` INT(10) DEFAULT 0 COMMENT '说明';

-- 添加在开头
ALTER TABLE `表名` ADD `字段名` INT(10) DEFAULT 0 COMMENT '说明' FIRST;

-- 添加在指定字段之后
ALTER TABLE `表名` ADD `字段名` INT(10) DEFAULT 0 COMMENT '说明' AFTER `已存在的字段名`;
```

### 修改字段

```sql
-- 修改字段默认值
ALTER TABLE `表名` ALTER COLUMN `字段名` SET DEFAULT ...;

-- 修改字段名
ALTER TABLE `表名` CHANGE `旧字段名` `新字段名` INT(10);

-- 修改字段类型
ALTER TABLE `表名` MODIFY `字段名` <数据类型>;

-- 删除字段
ALTER TABLE `表名` DROP `字段名`;
```

### 索引操作

```sql
-- 添加唯一索引
ALTER TABLE `表名` ADD UNIQUE INDEX `索引名`(`字段名`);

-- 删除唯一索引
ALTER TABLE `表名` DROP INDEX <索引名>;
```

### 重置自增主键起始值

```sql
ALTER TABLE ${table_name} AUTO_INCREMENT = ${新的起始值};
```

---

## MySQL 基本操作

### 登录与连接

```bash
# 连接本地 MySQL 不需要 -h
mysql -h主机地址 -P端口号 -uroot -p123456
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `SHOW DATABASES;` | 查看所有数据库 |
| `SHOW TABLES FROM 数据库名;` | 查看某个数据库有什么表 |
| `CREATE DATABASE 数据库名;` | 创建数据库 |
| `USE 数据库名;` | 选择使用哪个数据库 |
| `SHOW TABLES;` | 查看当前数据库下有什么表 |
| `SOURCE 脚本路径;` | 执行 SQL 脚本导入数据 |
| `DROP DATABASE 数据库名;` | 删除数据库 |
| `DESC 表名;` | 查看表结构 |
| `SELECT DATABASE();` | 查看当前数据库 |
| `SELECT VERSION();` | 查看 MySQL 版本 |
| `\c` | 终止一条正在编写的语句 |
| `SHOW CREATE TABLE 表名;` | 查看创建表的语句 |

---

## DQL（数据查询）

### 查看 SQL 执行情况

```sql
EXPLAIN SELECT 字段名 FROM 表名 WHERE 条件;
```

### 普通查询

```sql
SELECT 字段名 `别名`, 字段名 `别名` FROM 表名;
```

### 完整 DQL 语句

```sql
SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY ...;
```

**执行顺序**：`FROM` → `ON` → `JOIN` → `WHERE` → `GROUP BY` → `WITH CUBE | WITH ROLLUP` → `HAVING` → `SELECT` → `DISTINCT` → `ORDER BY` → `TOP`

### 条件查询

```sql
SELECT 字段名 FROM 表名 WHERE 条件;
```

| 操作符 | 说明 |
|--------|------|
| `AND` | 并且 |
| `OR` | 或 |
| `IS NOT NULL` / `IS NULL` | 非空 / 为空 |
| `IN(...)` | 包含 |
| `NOT IN(...)` | 不包含 |
| `BETWEEN ? AND ?` | 闭区间（左小右大） |

> **注意**：`BETWEEN` 运用在字符上时，是左闭右开。例如 `SELECT name FROM emp WHERE name BETWEEN 'A' AND 'C'` 结果只有首字母是 A-B 的 name。

### 模糊查询（LIKE）

```sql
-- % 代表任意多个字符
-- _ 下划线代表任意一个字符
LIKE '%A%';
```

### 排序查询

```sql
-- ASC 升序；DESC 降序；不写默认升序
SELECT name, sal FROM emp ORDER BY sal;

-- 多字段排序（前面的字段起主导作用，只有前面字段排序后有相同的情况下，后面的字段排序指令才会生效）
SELECT name, sal FROM emp ORDER BY sal, name DESC;

-- 还可以按字段的顺序排列（不推荐）
SELECT name, sal FROM emp ORDER BY 1; -- 按查询的第一个字段默认升序排列
```

### 分组函数 / 多行处理函数

分组函数都是对**某一组**（某一字段下）数据进行操作，分组函数自动忽略 `NULL`。

> **注意**：分组函数不可直接使用在 `WHERE` 中，因为 `GROUP BY` 是在 `WHERE` 之后执行的。

```sql
-- 可以组合使用
SELECT COUNT(*), SUM(sal), AVG(sal), MAX(sal), MIN(sal) FROM emp;
```

| 函数 | 说明 |
|------|------|
| `COUNT(字段)` | 计数 |
| `SUM(字段)` | 求和 |
| `AVG(字段)` | 平均值 |
| `MAX(字段)` | 最大值 |
| `MIN(字段)` | 最小值 |

### 分组查询

```sql
-- 基本分组
SELECT MAX(sal) FROM emp GROUP BY job;

-- 多字段分组
SELECT no, job, MAX(sal) FROM emp GROUP BY no, job;
```

> 当一条 SQL 语句有 `GROUP BY` 时，`SELECT` 后面只可以跟被分组的字段名和分组函数。在非严格模式下会返回缺失数据，在严格模式下会报错。

### 分组过滤（HAVING）

进行分组之后过滤，优先使用 `WHERE`，如果 `WHERE` 无法解决再使用 `HAVING`。

```sql
SELECT MAX(sal), no, job FROM emp GROUP BY no HAVING MAX(sal) > 2900;
```

### 汇总（WITH ROLLUP）

此函数是对聚合函数进行求和，注意 `WITH ROLLUP` 是对 `GROUP BY` 后的第一个字段进行分组求和。

```sql
GROUP BY `field_name`, `field_name` WITH ROLLUP
```

### EXISTS（是否存在）

```sql
-- 基本用法
SELECT EXISTS(子查询);

-- 搭配 WHERE
SELECT * FROM `table_name` WHERE EXISTS(子查询);

-- 搭配 NOT
SELECT * FROM `table_name` WHERE NOT EXISTS(子查询);
```

### 条件函数

```sql
-- IF：如果 expr1 为 true 返回 expr2，否则返回 expr3
IF(expr1, expr2, expr3)

-- IFNULL：空处理函数，如果字段为 NULL 则当作指定值处理
SELECT IFNULL(SUM(field), 0) FROM ... WHERE ...

-- NULLIF：如果 expr1 = expr2 返回 NULL，否则返回 expr1
NULLIF(expr1, expr2)

-- ISNULL：如果 expr 为 NULL 返回 1，否则返回 0
ISNULL(expr1)

-- COALESCE：返回第一个非 NULL 的值，如果都为 NULL 则返回 NULL
SELECT COALESCE(SUM(field), SUM(field), 0);
```

### 字符串拼接（CONCAT）

```sql
UPDATE `t_project` SET `name` = CONCAT(`name`, "要添加的字符串") WHERE `id` = #{id};
```

### 查询结果集去重（DISTINCT）

`DISTINCT` 只能出现在所有字段的最前方，意思是后方的字段联合起来去重。

```sql
SELECT DISTINCT 字段名1, 字段名2 FROM 表名 ORDER BY 字段名1;
```

---

## 连接查询

### 连接查询的分类

- 根据语法年代：SQL92、SQL99
- 根据连接方式：

| 连接类型 | 子类型 |
|----------|--------|
| 内连接 | 等值连接、非等值连接、自连接 |
| 外连接 | 左外连接、右外连接、全连接 |

### 笛卡尔积现象

如果两张表连接，没有条件限制，那么就会产生两张表记录条数的乘积。

> **提问**：避免笛卡尔积现象可以通过加条件查询，那么加了条件就会减少匹配的次数吗？
> **答**：不会，次数还是那么多次，但是会过滤显示，只显示有效记录。

### 表的别名的两个作用

1. 执行效率高
2. 可读性好

> 如果不给别名会导致去每一个表中都查找 `name` 字段名的数据，也就是说别名可以指定某个字段只在某个表中查找，提高效率。

### 内连接查询

```sql
-- 等值连接
SELECT a.name, b.age
FROM A a
JOIN B b ON a.id = b.id
WHERE a.id = #{id};

-- 非等值连接
SELECT ...
FROM A a
JOIN B b ON a.sal BETWEEN b.minsal AND b.maxsal;

-- 自连接（一张表看作两张表，自己连自己）
```

### 外连接

- **内连接**：两张表没有主次之分，将两张表能匹配上的数据都查出来
- **外连接**：A 表作为主表，B 表作为副表，以 A 表的数据为主，如果 B 表匹配不上 A 表的某条数据，那么就自动补上 `NULL`

```sql
-- 左外连接
LEFT JOIN

-- 右外连接
RIGHT JOIN
```

### 子查询

子查询即 `SELECT` 中嵌套 `SELECT`。

子查询可以出现在：

```sql
-- WHERE 子句中
SELECT ... FROM ... WHERE (SELECT ...);

-- FROM 子句中
SELECT ... FROM (SELECT ...) AS 别名 ...;

-- SELECT 子句中
SELECT (SELECT ...) FROM ...;
```

---

## DML（数据操作）

### UPDATE

```sql
-- UPDATE 的 WHERE 是可选的，如果省略，将代表更新表中的所有行
UPDATE `table_name`
SET `field_name` = value,
    `field_name` = value
WHERE 过滤条件;

-- 将字段中的部分字符串替换为指定字符串
UPDATE `table_name` SET `column` = REPLACE(`column`, '旧的部分字符', '新的部分字符');

-- 连表更新
UPDATE `t_1` AS a
LEFT JOIN `t_2` AS b ON a.id = b.a_id
SET a.xxx = ...;
```

### INSERT

```sql
-- IGNORE：忽略错误的行，继续执行后面的行插入
INSERT IGNORE INTO `table_name` (`field_name`, `field_name`)
VALUES (value, value);

-- 插入多行
INSERT IGNORE INTO `table_name` (`field_name`, `field_name`)
VALUES
    (value, value),
    (value, value);

-- 为所有字段添加值
INSERT IGNORE INTO `table_name`
VALUES
    (value, value, value),
    (value, value, value);
```

### DELETE

> **注意**：一定要加 `WHERE`，否则是全表删除！

```sql
DELETE FROM `table_name` WHERE 条件;
```

---

## mysqldump

MySQL 用于转储数据库的实用程序。

> **警告**：默认情况下，来自具有 GTID 的服务器的部分转储将包括所有事务的 GTID，即使那些更改数据库而被抑制部分的事务。如果不希望恢复 GTID，请通过 `--set-gtid-purged=OFF`。要进行完整的转储，请传递 `--all-databases --triggers --routines --events`。

### 常用参数

| 参数 | 说明 |
|------|------|
| `--all-databases` | 导出所有的库 |
| `--triggers` | 导出触发器 |
| `--routines` | 导出存储过程 |
| `--events` | 导出事件 |
| `--column-statistics=0` | MySQL 8.0 需要添加该配置 |
| `--set-gtid-purged=off` | 备份单个表时建议关闭，全库备份建议开启 |
| `-d` | 只导出表结构，不加此参数导出结构以及表数据 |

### 导出

```bash
# 导出单个表
mysqldump -u <userName> -p -h <host> -P <port> <databaseName> <tableName> > <localhostPath> --set-gtid-purged=off --column-statistics=0

# 备份多个数据库
mysqldump -u <userName> -p --databases <databaseName> <databaseName> > <localhostPath>

# 备份所有数据库
mysqldump -u <userName> -p --all-databases > <localhostPath>
```

### 导入

**方式一**：不需要登录 MySQL，直接命令行操作

```bash
mysql -h<ip> -P<host> -u<username> -p<password> <database-name> < /xxx/xxx/xx.sql
```

**方式二**：登录 MySQL 后执行

```bash
mysql -h<ip> -P<host> -u<username> -p<password>
USE <database-name>;
SOURCE /xxx/xxx/xx.sql;
```

---

## 外键约束

MySQL 通过外键约束来保证表与表之间的数据的完整性和准确性。

### 使用条件

1. 两个表都必须是 `InnoDB` 表
2. 外键关系的两个表的对应字段应该采用同一类型或者是可以转换的类型
3. 如果使用主表的自增 id 作为从表的外键，在迁移数据时可能会出现数据不对应的情况

### 创建外键

```sql
-- 直接跟在字段后面
`fieldName` filedType REFERENCES master_table_name (master_field_name) ON DELETE/ON UPDATE <级联策略>

-- SQL 最后添加
FOREIGN KEY (field_name) REFERENCES master_table_name (master_field_name) <级联策略>

-- 建表后添加
ALTER TABLE table_name ADD FOREIGN KEY (field_name) REFERENCES master_table_name (master_field_name) <级联策略>
```

### 外键策略

| 策略 | 说明 |
|------|------|
| `RESTRICT` | 限制从表中的外键改动 |
| `CASCADE` | 跟随外键改动 |
| `SET NULL` | 设空值 |
| `SET DEFAULT` | 设默认值 |
| `NO ACTION` | 无动作（默认） |

---

## EXPLAIN 详解

### 字段结构

| 字段 | 含义 |
|------|------|
| `id` | 该语句的唯一标识 |
| `select_type` | 查询类型 |
| `table` | 表名 |
| `partitions` | 匹配的分区 |
| `type` | 联接类型 |
| `possible_keys` | 可能选择的索引 |
| `key` | 实际选择的索引 |
| `key_len` | 索引的长度 |
| `ref` | 索引的哪一列被引用了 |
| `rows` | 估计要扫描的行数 |
| `filtered` | 表示符合查询条件的数据百分比 |
| `Extra` | 附加信息 |

### 字段详解

#### id

该语句的唯一标识。如果 EXPLAIN 的结果包括多个 id 值，则数字越大越先执行；对于相同 id 的行，则表示从上往下依次执行。

#### select_type

| 值 | 说明 |
|----|------|
| `SIMPLE` | 简单查询（未使用 UNION 或子查询） |
| `PRIMARY` | 最外层的查询 |
| `UNION` | UNION 中的第二个和随后的 SELECT |
| `DEPENDENT UNION` | UNION 中的第二个或后面的查询，依赖了外面的查询 |
| `UNION RESULT` | UNION 的结果 |
| `SUBQUERY` | 子查询中的第一个 SELECT |
| `DEPENDENT SUBQUERY` | 子查询中的第一个 SELECT，依赖了外面的查询 |
| `DERIVED` | 派生表（FROM 子句中的子查询） |
| `DEPENDENT DERIVED` | 派生表，依赖了其他的表 |
| `MATERIALIZED` | 物化子查询 |
| `UNCACHEABLE SUBQUERY` | 子查询结果无法缓存 |
| `UNCACHEABLE UNION` | UNION 属于 UNCACHEABLE SUBQUERY 的第二个或后面的查询 |

#### type（性能从高到低）

| 类型 | 说明 |
|------|------|
| `system` | 该表只有一行（相当于系统表），const 类型的特例 |
| `const` | 针对主键或唯一索引的等值查询扫描，最多只返回一行数据 |
| `eq_ref` | 使用了索引的全部组成部分，且索引是 PRIMARY KEY 或 UNIQUE NOT NULL |
| `ref` | 满足索引的最左前缀规则，或者索引不是主键也不是唯一索引 |
| `fulltext` | 全文索引 |
| `ref_or_null` | 类似 ref，但 MySQL 会额外搜索哪些行包含了 NULL |
| `index_merge` | 使用了索引合并优化，一个查询里面用到了多个索引 |
| `unique_subquery` | 类似 eq_ref，但使用了 IN 查询，且子查询是主键或者唯一索引 |
| `range` | 范围扫描，带有 BETWEEN、`>`、`>=`、`<`、`<=`、`IS NULL`、`LIKE`、`IN()` 等 |
| `index` | 全索引扫描 |
| `ALL` | 全表扫描 |

#### 其他字段

- **possible_keys**：展示当前查询可以使用哪些索引
- **key**：MySQL 实际选择的索引
- **key_len**：索引中使用的字节数。当字段允许为 NULL 时，key_len 比不允许为空时大 1 字节
- **ref**：表示将哪个字段或常量和 key 列所使用的字段进行比较
- **rows**：MySQL 估算会扫描的行数，数值越小越好
- **filtered**：表示符合查询条件的数据百分比。用 `rows × filtered` 可获得和下一张表连接的行数

---

## 开发中的常见问题

### 设定 UUID

```sql
-- MySQL 8.0.13 开始可以使用表达式作为默认值
DEFAULT (UUID())

-- 替换 UUID 中的 "-"
DEFAULT (REPLACE(UUID(), "-", ""))
```

### 插入数据后返回自增 id

```sql
-- LAST_INSERT_ID 基于 connection，每个线程使用独立的 Connection 对象即可保证正确
SELECT LAST_INSERT_ID();
```

**MyBatis 支持方式**：

```xml
<!-- selectKey 方式 -->
<selectKey resultType="Integer" keyProperty="id" order="AFTER">
    SELECT LAST_INSERT_ID() AS id
</selectKey>

<!-- useGeneratedKeys 方式 -->
<insert id="xx" useGeneratedKeys="true" keyProperty="id">
```

### sql_mode = only_full_group_by

```sql
-- 临时修改（全局）
SET @@global.sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
-- 或针对当前数据库
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
```

**或编辑 `my.cnf` 文件**（一般在 `/etc/my.cnf`、`/etc/mysql/my.cnf`）：
```
sql-mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION
```

### Lock wait timeout exceeded

```sql
-- 查看所有进行中的事务
SELECT * FROM information_schema.INNODB_TRX;

-- 获取 trx_mysql_thread_id，然后杀死进程
KILL 4523949;
```

### COUNT(*) 和 COUNT(1)

`COUNT(*)` 是 ANSI 标准语法，对于性能和 `COUNT(1)` 本质区别不大，更推荐使用 `COUNT(*)`。

### 类型转换（CONVERT 和 CAST）

```sql
-- 在 MySQL 中这两个函数没有区别
-- CAST() 是 ANSI 标准语法，移植性更好
CONVERT(expr, type);
CAST(expr AS type);
```

### 是否使用 JOIN

- **Index Nested-Loop Join**：如果能使用，JOIN 有一定优势
- **Block Nested-Loop Join**：应尽量避免

**连表规范**：
- 小表做驱动表
- 命中索引

---

## 三大范式

| 范式 | 要求 |
|------|------|
| 第一范式（1NF） | 每个字段都是不可再分的原子值 |
| 第二范式（2NF） | 在 1NF 基础上，非主键字段必须完全依赖于主键 |
| 第三范式（3NF） | 在 2NF 基础上，非主键字段不能传递依赖于主键 |

---

## 事务隔离级别

| 级别 | 说明 | 问题 |
|------|------|------|
| 读未提交（READ UNCOMMITTED） | 可以读到其他事务未提交的数据 | 脏读、幻读、不可重复读 |
| 读已提交（READ COMMITTED） | 可以读到已经提交的数据，同一事务不同时刻可能读到不同数据 | 幻读、不可重复读 |
| 可重复读（REPEATABLE READ） | **InnoDB 默认事务级别**，通过快照方式保证同一事务不会读到其他事务的修改 | 通过间隙锁解决幻读 |
| 串行（SERIALIZABLE） | 所有事务串行执行 | 无 |

---

## 编码和字符集的关系

计算机真正保存和传输数据都是以二进制 0101 的格式进行的。需要有一个规则把文字转化为二进制：

- **ASCII**：用一个字节（8 位）标识字符，只能表示英文字母和数字
- **GB2312**：为了标识中文
- **Unicode**：用 2~4 个字节表示字符，完全兼容 ASCII
- **UTF-8**：在 Unicode 基础上做的优化，可变长编码

```
D ASCII:     01100100
D Unicode:   00000000 01100100  -- 比 ASCII 多用一个字节，前面都是 0
D UTF-8:     01100100          -- 该隐藏时隐藏，节省空间
```

### utf8 和 utf8mb4 的区别

| 字符集 | 最多字节 | 说明 |
|--------|----------|------|
| `utf8`（utf8mb3） | 3 字节 | 阉割版 UTF-8，不支持 emoji 等 4 字节字符 |
| `utf8mb4` | 4 字节 | 完整 UTF-8，支持所有字符 |

> MySQL 中 `utf8` 并非真正的 UTF-8，它最多支持 3 个字节，准确地说应该叫 `utf8mb3`。emoji 表情需要 4 个字节，所以 `utf8` 不支持。

**劣势**：如果字段类型为 `CHAR(2)`，使用 `utf8mb4` 会保留 `2 × 4 = 8` 字节空间，而 `utf8mb3` 只需 `2 × 3 = 6` 字节，`utf8mb4` 会多占用一些空间。

### Collation（比较规则）

通过以下命令查看 `utf8mb4` 支持的比较规则：

```sql
SHOW COLLATION WHERE Charset = 'utf8mb4';
```

| 排序规则 | 说明 |
|----------|------|
| `utf8mb4_general_ci` | 挨个字符比较，不区分大小写（`debug` = `Debug`） |
| `utf8mb4_bin` | 挨个比较二进制位大小（`debug` ≠ `Debug`） |

---

## InnoDB 和 MyISAM 的区别

### 对比表

| 特性 | InnoDB | MyISAM |
|------|--------|--------|
| 事务特性 | ✅ 支持 ACID 事务，可回滚 | ❌ 不支持事务 |
| 锁机制 | 行级锁，高并发性能好 | 表级锁，并发写入性能差 |
| 外键约束 | ✅ 支持 | ❌ 不支持 |
| 崩溃恢复 | ✅ 自动崩溃恢复（redo log） | ❌ 需手动修复 |
| 索引结构 | 聚簇索引，主键查询最快，辅助索引需回表 | 非聚簇索引，所有索引性能一致 |
| 存储特点 | 单文件（`.ibd`），占用空间较大 | 三文件（`.frm` / `.MYD` / `.MYI`），支持压缩 |
| 性能特点 | 写入性能好，支持高并发，MVCC 无读锁 | 读取速度快，写入时锁表，适合读多写少 |

### 索引结构区别

#### InnoDB：聚簇索引（Clustered Index）

- 主键索引的叶子节点存储**完整的行数据**
- 辅助索引的叶子节点存储**主键值**

```
                    InnoDB 聚簇索引（主键索引）
                           Root Node
                              [5]
                             /   \
                            /     \
                      [2,4]         [7,9]
                     /  |  \       /  |  \
                    /   |   \     /   |   \
              [1]     [3]   [4] [6]  [8]  [10]
              |       |     |   |    |    |
         ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
         │ id=1    │ │ id=3    │ │ id=6    │ │ id=8    │
         │ name=A  │ │ name=C  │ │ name=F  │ │ name=H  │
         │ age=25  │ │ age=30  │ │ age=28  │ │ age=35  │
         │ email=..│ │ email=..│ │ email=..│ │ email=..│
         └─────────┘ └─────────┘ └─────────┘ └─────────┘
         完整行数据   完整行数据   完整行数据   完整行数据

                    InnoDB 辅助索引（name 索引）
                           Root Node
                            [M]
                           /   \
                          /     \
                    [D,H]         [P,T]
                   /  |  \       /  |  \
                  /   |   \     /   |   \
            [Alice] [Bob] [Charlie] [David] [Eve]
               |     |       |        |      |
              ┌─┐   ┌─┐     ┌─┐      ┌─┐    ┌─┐
              │1│   │3│     │6│      │8│    │10│
              └─┘   └─┘     └─┘      └─┘    └─┘
            主键值 主键值   主键值    主键值  主键值
                    ↓
                需要回表查询聚簇索引获取完整数据
```

#### MyISAM：非聚簇索引（Non-Clustered Index）

- 所有索引的叶子节点都存储**数据文件的指针**
- 主键索引和辅助索引结构相同

```
                    MyISAM 数据文件 (.MYD)
        ┌─────────────────────────────────────────────┐
        │ 物理位置0: id=1, name=Alice, age=25, email=..│
        ├─────────────────────────────────────────────┤
        │ 物理位置1: id=3, name=Bob, age=30, email=... │
        ├─────────────────────────────────────────────┤
        │ 物理位置2: id=6, name=Charlie, age=28, email=│
        ├─────────────────────────────────────────────┤
        │ 物理位置3: id=8, name=David, age=35, email=..│
        ├─────────────────────────────────────────────┤
        │ 物理位置4: id=10, name=Eve, age=22, email=.. │
        └─────────────────────────────────────────────┘

                    MyISAM 主键索引 (.MYI)
                           Root Node
                              [6]
                             /   \
                            /     \
                      [1,3]         [8,10]
                     /  |  \       /   |   \
                    /   |   \     /    |    \
                  [1]  [3]  [6]  [8]  [10]  [...]
                   |    |    |    |     |
                  ┌─┐  ┌─┐  ┌─┐  ┌─┐   ┌─┐
                  │0│  │1│  │2│  │3│   │4│
                  └─┘  └─┘  └─┘  └─┘   └─┘
               指针0  指针1 指针2 指针3  指针4
                 ↓      ↓     ↓     ↓      ↓
               指向数据文件的物理位置

                    MyISAM 辅助索引 (name 索引)
                           Root Node
                            [Charlie]
                           /         \
                          /           \
                   [Alice,Bob]      [David,Eve]
                   /    |    \      /     |    \
                  /     |     \    /      |     \
            [Alice]   [Bob]  [Charlie] [David] [Eve]
               |       |        |       |       |
              ┌─┐     ┌─┐      ┌─┐     ┌─┐     ┌─┐
              │0│     │1│      │2│     │3│     │4│
              └─┘     └─┘      └─┘     └─┘     └─┘
            指针0   指针1    指针2   指针3   指针4
              ↓       ↓        ↓       ↓       ↓
            指向数据文件的物理位置
```

> MyISAM 的数据分为三份：表结构定义、主键索引、辅助索引。主键索引和辅助索引没有太大性能区别，都需要找到索引后再去数据文件找到对应的数据。

### 存储结构区别

```
                    InnoDB 存储 (.ibd 文件)
        ┌─────────────────────────────────────────────┐
        │                表空间头部                    │
        ├─────────────────────────────────────────────┤
        │                                             │
        │            聚簇索引区域                      │
        │    ┌─────────────────────────────────┐      │
        │    │        索引页                    │      │
        │    │  ┌─────┬─────┬─────┬─────┐      │      │
        │    │  │ id=1│ id=3│ id=6│ id=8│      │      │
        │    │  │完整 │完整 │完整 │完整 │      │      │
        │    │  │数据 │数据 │数据 │数据 │      │      │
        │    │  └─────┴─────┴─────┴─────┘      │      │
        │    └─────────────────────────────────┘      │
        │                                             │
        ├─────────────────────────────────────────────┤
        │                                             │
        │           辅助索引区域                       │
        │    ┌─────────────────────────────────┐      │
        │    │       name 索引页                │      │
        │    │  ┌─────┬─────┬─────┬─────┐      │      │
        │    │  │Alice│ Bob │Char.│David│      │      │
        │    │  │ →1  │ →3  │ →6  │ →8  │      │      │
        │    │  └─────┴─────┴─────┴─────┘      │      │
        │    └─────────────────────────────────┘      │
        │                                             │
        └─────────────────────────────────────────────┘

                    MyISAM 存储（三个文件）

    .frm 文件            .MYI 文件            .MYD 文件
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│             │        │             │        │             │
│  表结构定义  │        │  主键索引    │        │   实际数据   │
│             │        │ ┌─────────┐ │        │ ┌─────────┐ │
│ 列定义      │        │ │  id=1   │ │        │ │ Record1 │ │
│ 约束信息    │        │ │  ↓ptr0  │ │        │ │ Record2 │ │
│ 索引定义    │        │ │  id=3   │ │        │ │ Record3 │ │
│ ...         │        │ │  ↓ptr1  │ │        │ │ Record4 │ │
│             │        │ │  ...    │ │        │ │ ...     │ │
│             │        │ └─────────┘ │        │ └─────────┘ │
│             │        │             │        │             │
│             │        │ 辅助索引     │        │             │
│             │        │ ┌─────────┐ │        │             │
│             │        │ │ Alice   │ │        │             │
│             │        │ │ ↓ptr0   │ │        │             │
│             │        │ │ Bob     │ │        │             │
│             │        │ │ ↓ptr1   │ │        │             │
│             │        │ │ ...     │ │        │             │
│             │        │ └─────────┘ │        │             │
└─────────────┘        └─────────────┘        └─────────────┘
```

### B+ 树结构的说明

InnoDB 和 MyISAM 都是 B+ 树结构。

**B+ 树的设计原则**：
- 所有数据都在叶子节点
- 非叶子节点只用于导航
- 查询必须到达叶子节点

**根节点的作用**：
- 存储分割键值，不是实际数据
- 提供查询路由功能
- 永远不会被"命中"返回数据

**查询过程**：
- 无论查询什么值，都要走到叶子节点
- 即使查询的键值在根节点出现，也要继续向下
- 这保证了查询性能的一致性

**为什么这样设计**：
- 保证所有查询的 I/O 次数一致
- 简化了索引维护逻辑
- 优化了范围查询性能

---

## MySQL 日志

MySQL 日志主要包括查询日志、慢查询日志、事务日志、错误日志、二进制日志等。其中比较重要的是 `bin log`（二进制日志）、`redo log`（重做日志）和 `undo log`（回滚日志）。

| 日志类型 | 级别 | 作用 |
|----------|------|------|
| `bin log`（二进制日志） | 数据库级别 | 记录所有修改操作，用于恢复和同步数据库 |
| `redo log`（重做日志） | InnoDB 引擎级别 | 记录事务日志，用于崩溃恢复 |
| `undo log`（回滚日志） | InnoDB 引擎级别 | 记录修改前的内容，用于事务回滚和 MVCC |

### bin log（二进制日志）

`bin log` 是 MySQL 数据库级别的文件，记录对 MySQL 数据库执行修改的所有操作，不会记录 `SELECT` 和 `SHOW` 语句，主要用于**恢复数据库**和**同步数据库**。

### redo log（重做日志）

`redo log` 是 InnoDB 引擎级别，用来记录 InnoDB 存储引擎的事务日志，不管事务是否提交都会记录下来，用于**数据恢复**。当数据库发生故障，InnoDB 存储引擎会使用 `redo log` 恢复到发生故障前的时刻。将参数 `innodb_flush_log_at_tx_commit` 设置为 1，在执行 `COMMIT` 时会将 `redo log` 同步写到磁盘。

### undo log（回滚日志）

除了记录 `redo log` 外，当进行数据修改时还会记录 `undo log`，`undo log` 用于数据的撤回操作，它保留了记录修改前的内容。通过 `undo log` 可以实现**事务回滚**，并且可以根据 `undo log` 回溯到某个特定的版本的数据，实现 **MVCC**。
