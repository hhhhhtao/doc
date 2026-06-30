# Redis

## 概述

Redis 具备以下特点：

- **支持数据持久化** — 可以将内存中的数据保存在磁盘中，重启时可以再次加载使用。
- **支持多种数据结构** — 不仅支持简单的 key-value 类型数据，还提供 list、set、zset、hash 等数据结构的存储。
- **支持数据备份** — 支持 master-slave 模式的数据备份。
- **性能极高** — 读速度 110000 次/s，写速度 81000 次/s。

## 启动与关闭

### 启动 Redis

**前台启动：**

```bash
redis-server
```

**后台启动（Windows 服务）：**

```bash
# 将 Redis 绑定为 Windows 服务
redis-server --service-install redis.windows.conf --loglevel verbose

# 启动服务
redis-server --service-start

# 停止服务
redis-server --service-stop

# 删除服务
redis-server --service-uninstall
```

### 关闭 Redis

```bash
redis-cli shutdown
```

## 连接客户端

**直接连接（默认 127.0.0.1:6379）：**

```bash
redis-cli

# 登录后输入密码
auth <password>
```

**指定 IP 和端口连接：**

```bash
redis-cli -h 127.0.0.1 -p 6379
```

**退出客户端：**

```bash
exit
# 或
quit
```

## 基本操作

| 命令 | 说明 |
|------|------|
| `redis-benchmark` | 测试 Redis 性能（在 cmd 下执行） |
| `ping` | 沟通命令，返回 `PONG` 表示服务正常 |
| `info [section]` | 查看 Redis 服务器的统计信息 |
| `select <db>` | 切换数据库（默认 16 个库，0~15） |
| `dbsize` | 查看当前数据库中 key 的数目 |
| `keys *` | 查看当前数据库中有哪些 key |
| `flushdb` | 清空当前库 |
| `flushall` | 清空所有数据库 |
| `config get <parameter>` | 获取运行中 Redis 的配置参数 |

**参考手册：**

- 英文版：<https://redis.io/commands>
- 中文版：<http://redisdoc.com>

## Key 操作命令

**keys**

```bash
keys pattern
```

查找所有符合模式 `pattern` 的 key。支持通配符：

| 通配符 | 说明 | 示例 |
|--------|------|------|
| `*` | 匹配 0 或多个字符 | `keys *` 查询所有 key |
| `?` | 匹配单个字符 | `wo?d` 匹配 `word`、`wood` |
| `[]` | 匹配括号内一个字符 | `wo[or]d` 匹配 `word`、`wood` |

```bash
keys h*o    # 查看以h开头、以o结尾的key
keys h?o    # 查看以h开头、以o结尾且中间只有一个字符的key
keys h[abc]llo
```

**exists**

```bash
exists key [key...]
```

判断 key 是否存在。返回值：存在返回 1，使用多个 key 返回存在的数量。

**move**

```bash
move key db
```

移动 key 到指定的数据库，原库中删除。

**ttl**

```bash
ttl key
```

查看 key 的剩余生存时间（秒）。返回值：`-1` 永不过期，`-2` key 不存在。

**expire**

```bash
expire key seconds
```

设置 key 的生存时间，超时自动删除。

**type**

```bash
type key
```

查看 key 所存储值的数据类型。返回值：`none`、`string`、`list`、`set`、`zset`、`hash`。

**rename**

```bash
rename key newkey
```

将 key 重命名为 `newkey`，若 `newkey` 已存在则覆盖旧值。

**del**

```bash
del key [key...]
```

删除指定的 key，不存在的 key 忽略。返回值：删除的 key 的数量。

## 字符串类型（String）

字符串类型是 Redis 中最基本的数据类型，能存储任何形式的字符串，包括二进制数据、序列化数据、JSON 对象甚至图片。

**set**

```bash
set key value
```

设置 key 的值为 `value`，若 key 已存在则覆盖。

```bash
set zsname zhangsan
set zsage 20
```

**get**

```bash
get key
```

获取 key 中存储的字符串值。key 不存在返回 `nil`。

**append**

```bash
append key value
```

将 `value` 追加到 key 原有值的末尾。若 key 不存在则创建。返回值：追加后的字符串长度。

```bash
set phone 13800
append phone 138000
```

**strlen**

```bash
strlen key
```

返回 key 所存储的字符串值的长度。key 不存在返回 0。

**incr / decr**

```bash
incr key
decr key
```

将 key 中存储的数字值加 1 / 减 1。若 key 不存在则初始化为 0 再执行。

**incrby / decrby**

```bash
incrby key offset
decrby key offset
```

将 key 所存储的值加上 / 减去增量值 `offset`。

**getrange**

```bash
getrange key startIndex endIndex
```

获取 key 中从 `startIndex` 到 `endIndex` 的子字符串（含两端）。负数表示从末尾开始，`-1` 表示最后一个字符。

```bash
set zsname zhangsan
getrange zsname 2 5      # angs
getrange zsname 0 -1     # zhangsan
```

**setrange**

```bash
setrange key offsetIndex value
```

用 `value` 覆盖 key 从 `offsetIndex` 开始的值。

```bash
setrange zsname 5 xiaosan   # zhangxiaosan
```

**setex**

```bash
setex key seconds value
```

设置 key 的值，并将生存时间设为 `seconds` 秒。

```bash
setex k1 10 v1   # 保存10秒
```

**setnx**

```bash
setnx key value
```

仅当 key 不存在时设置值（set if not exists）。

**mset / mget**

```bash
mset key value [key value...]
mget key [key...]
```

同时设置 / 获取多个 key-value 对。

```bash
mset k1 v1 k2 v2 k3 v3
mget k1 k2 k3
```

**msetnx**

```bash
msetnx key value [key value...]
```

同时设置多个 key-value 对，仅当所有 key 都不存在时成功（原子性）。

## 列表类型（List）

Redis 列表是简单的字符串列表，按插入顺序排序。可以在头部（左边）、尾部（右边）或中间添加元素。头尾操作效率极高，中间操作效率较低。

**lpush**

```bash
lpush key value [value...]
```

将一个或多个值插入到列表最左边（表头）。返回值：插入后列表的长度。

```bash
lpush list01 1 2 3      # 结果：3 2 1
lpush list01 4 5         # 结果：5 4 3 2 1
```

**rpush**

```bash
rpush key value [value...]
```

将一个或多个值插入到列表最右边（表尾）。

```bash
rpush list02 1 2 3      # 结果：1 2 3
```

**lrange**

```bash
lrange key startIndex endIndex
```

获取列表中指定下标区间的元素。下标从 0 开始，负数表示从后往前。

```bash
lrange list01 1 3          # 结果：4 3 2
lrange list01 0 -1         # 结果：5 4 3 2 1
```

**lpop / rpop**

```bash
lpop key
rpop key
```

移除并返回列表头部 / 尾部第一个元素。

**lindex**

```bash
lindex key index
```

获取列表中指定下标的元素，不删除。`0` 表示第一个元素，`-1` 表示最后一个。

**llen**

```bash
llen key
```

获取列表的长度。

**lrem**

```bash
lrem key count value
```

根据 `count` 移除列表中与 `value` 相等的元素：

| count | 行为 |
|-------|------|
| `count > 0` | 从左侧向右移除 |
| `count < 0` | 从尾部开始移除 |
| `count = 0` | 移除所有匹配元素 |

```bash
lpush list03 a a b c a d e a b b
lrem list03 2 a    # 结果：b b e d c b a a
lrem list03 0 a    # 结果：b b e d c b
```

**ltrim**

```bash
ltrim key startIndex endIndex
```

截取 key 的指定下标区间元素，重新赋值给 key。

```bash
lpush list04 1 2 3 4 5   # 结果：5 4 3 2 1
ltrim list04 1 3          # 结果：4 3 2
```

**lset**

```bash
lset key index value
```

将列表中指定下标的元素设置为 `value`。

```bash
lset list04 1 10   # 结果：4 10 2
```

**linsert**

```bash
linsert key before/after pivot value
```

将 `value` 插入到列表中值 `pivot` 之前或之后的位置。

```bash
rpush mylist Hello
rpush mylist World
linsert mylist BEFORE World There   # Hello There World
```

## 集合类型（Set）

Redis 的 Set 是 string 类型的无序不重复集合。

**sadd**

```bash
sadd key member [member...]
```

将一个或多个元素加入集合，已存在的元素被忽略。

```bash
sadd set01 a b c a   # 结果：a b c
```

**smembers**

```bash
smembers key
```

获取集合中的所有成员。

**sismember**

```bash
sismember key member
```

判断元素是否是集合成员。是返回 1，否返回 0。

**scard**

```bash
scard key
```

获取集合的元素个数。

**srem**

```bash
srem key member [member...]
```

移除集合中一个或多个元素，不存在的元素被忽略。

**srandmember**

```bash
srandmember key [count]
```

随机返回集合中的元素（不删除）。`count` 为正数时返回不重复元素，为负数时返回的元素可能重复。

**spop**

```bash
spop key [count]
```

随机从集合中删除并返回一个或 `count` 个元素。

**smove**

```bash
smove src dest member
```

将元素从 `src` 集合移动到 `dest` 集合。

**sdiff**

```bash
sdiff key [key...]
```

返回第一个集合有而其他集合没有的元素（差集）。

**sinter**

```bash
sinter key [key...]
```

返回所有集合都有的元素（交集）。

**sunion**

```bash
sunion key [key...]
```

返回所有集合的并集（元素重复保留一个）。

## 哈希类型（Hash）

Redis 的 hash 是一个 string 类型的 key 和 value 的映射表，适合存储对象。

**hset**

```bash
hset key field value [field value ...]
```

将键值对设置到哈希表中。若 field 已存在则覆盖。

```bash
hset stu1001 id 1001
hset stu1001 name zhangsan
```

**hget**

```bash
hget key field
```

获取哈希表中指定 field 的值。

**hmset / hmget**

```bash
hmset key field value [field value...]
hmget key field [field...]
```

同时设置 / 获取多个 field-value。

```bash
hmset stu1002 id 1002 name lisi age 20
hmget stu1001 id name
```

**hgetall**

```bash
hgetall key
```

获取哈希表中所有的域和值。

**hdel**

```bash
hdel key field [field...]
```

删除哈希表中一个或多个 field。

**hlen**

```bash
hlen key
```

获取哈希表中 field 的个数。

**hexists**

```bash
hexists key field
```

判断 field 是否存在。

**hkeys / hvals**

```bash
hkeys key
hvals key
```

获取哈希表中所有 field / 所有 value。

**hincrby / hincrbyfloat**

```bash
hincrby key field int
hincrbyfloat key field float
```

为哈希表中指定 field 的值增加指定数值。

```bash
hincrby stu1002 age 1
hset stu1001 score 80.5
hincrbyfloat stu1001 score 5.5
```

**hsetnx**

```bash
hsetnx key field value
```

仅当 field 不存在时设置值。

## 有序集合类型（Zset）

Redis 有序集合与集合一样是 string 类型元素的集合，不允许重复成员。每个元素关联一个分数（可重复），通过分数从小到大排序。

**zadd**

```bash
zadd key score member [score member...]
```

将一个或多个成员及其分数加入有序集合。若 member 存在则覆盖分数。

```bash
zadd zset01 20 z1 30 z2 50 z3 40 z4
```

**zrange**

```bash
zrange key startIndex endIndex [WITHSCORES]
```

查询有序集合指定区间内的元素，按分数从小到大排序。`WITHSCORES` 选项可同时返回分数。

**zrangebyscore**

```bash
zrangebyscore key min max [WITHSCORES] [LIMIT offset count]
```

获取分数在 `min` 和 `max` 之间（含）的成员，按分数从小到大排序。

```bash
zrangebyscore zset01 30 50 withscores
```

**zrem**

```bash
zrem key member [member...]
```

删除有序集合中的一个或多个成员。

**zcard**

```bash
zcard key
```

获取有序集合的元素个数。

**zcount**

```bash
zcount key min max
```

获取分数在 `min` 和 `max` 之间的成员数量。

**zrank**

```bash
zrank key member
```

获取成员的排名（按分数从小到大，从 0 开始）。

**zscore**

```bash
zscore key member
```

获取成员的分数。

**zrevrank**

```bash
zrevrank key member
```

获取成员的排名（按分数从大到小，从 0 开始）。

**zrevrange**

```bash
zrevrange key startIndex endIndex [WITHSCORES]
```

查询有序集合指定区间内的元素，按分数从大到小排序。

**zrevrangebyscore**

```bash
zrevrangebyscore key max min [WITHSCORES] [LIMIT offset count]
```

获取分数在 `max` 和 `min` 之间（含）的成员，按分数从大到小排序。

## 主从复制

Redis 支持 Master/Slave（主/从）机制，主机数据更新后自动同步到从机。

- Master 以写为主，Slave 以读为主。
- 主少从多，主写从读，读写分离。

### 哨兵模式

哨兵模式是主机宕机时从机自动上位的自动化方案。哨兵是一个独立进程，通过发送命令监控主从服务器运行状态。当检测到 master 故障时，通过投票自动将某个 slave 切换为 master，并通过消息订阅模式通知其他 slave 切换主机。可以使用多哨兵进行监控。

#### 哨兵模式搭建

**1. 配置一主二从**

使用一台服务器模拟三台主机：

```bash
# 将 redis.conf 拷贝三份：redis6380.conf、redis6381.conf、redis6382.conf
# 分别修改端口、pid 文件名、日志文件名、rdb 文件名

# 例如 redis6380.conf：
port 6380
pidfile ./redis_6380.pid
logfile "6380.log"
dbfilename dump6380.rdb

# 分别开启三个 Redis 服务
redis-server redis6380.conf
redis-server redis6381.conf
redis-server redis6382.conf
```

**2. 查看主从信息**

```bash
info replication
```

**3. 设置主从关系（设从不设主）**

在 6381 和 6382 上执行：

```bash
slaveof 127.0.0.1 6380
```

或在配置文件中添加：

```ini
slaveof 127.0.0.1 6380
```

> 如果主 Redis 设置了密码，从库的配置中还需设置 `masterauth` 为主 Redis 的密码。

**4. 创建哨兵配置文件**

创建 `redis_sentinel.conf`，编辑内容：

```ini
# 指定监控主机的 IP、端口和哨兵投票数
sentinel monitor dc-redis 127.0.0.1 6380 1
```

**5. 启动哨兵**

```bash
# Windows
redis-server redis_sentinel.conf --sentinel

# Linux
redis-sentinel redis_sentinel.conf
```

**6. 模拟主机宕机**

```bash
redis-cli -h localhost -p 6380 shutdown
```

哨兵程序会自动选择从机上位。原主机恢复后会自动从属于新的主机。

#### 哨兵模式的缺点

主从复制存在延迟，主机负责写，从机负责备份，系统繁忙时延迟问题更严重，从机数量增加也会加剧此问题。

## Jedis 操作 Redis

Jedis 是 Redis 官方推荐的 Java 客户端，几乎涵盖 Redis 所有命令。

### 依赖

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>3.0.1</version>
</dependency>
```

### 示例代码

```java
public static void main(String[] args) {
    // 连接本地 Redis 服务器
    Jedis jedis = new Jedis("localhost", 6379);
    System.out.println("redis连接成功");

    // 查看服务是否运行
    System.out.println("服务正在运行: " + jedis.ping());

    // 清空数据库
    System.out.println(jedis.flushDB());

    // 存放数据
    jedis.set("myKey", "hello,redis");
    System.out.println(jedis.get("myKey"));

    // 存放 list 集合
    jedis.lpush("numberlists", "3");
    jedis.lpush("numberlists", "1");
    jedis.lpush("numberlists", "5");
    jedis.lpush("numberlists", "2");
    System.out.println("所有元素-numberlists：" + jedis.lrange("numberlists", 0, -1));

    // 获取并显示所有 key
    Set<String> keys = jedis.keys("*");
    Iterator<String> it = keys.iterator();
    while (it.hasNext()) {
        String key = it.next();
        System.out.println(key);
    }

    // 关闭连接
    jedis.close();
}
```

## SpringBoot 整合 Redis

### 起步依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

### 配置连接

```properties
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.database=0
```

### RedisTemplate 模板对象

Spring Boot 2.0 之后，容器自动生成了 `StringRedisTemplate` 和 `RedisTemplate<Object, Object>`，可直接注入使用。

```java
// String 模板对象
@Autowired
private StringRedisTemplate stringRedisTemplate;

// Object 模板对象
@Autowired
private RedisTemplate redisTemplate;
```

> 使用 `RedisTemplate` 存取对象时，对象需实现 `Serializable` 接口。

### 键值对操作器

```java
redisTemplate.opsForValue();   // String 操作
redisTemplate.opsForList();    // List 操作
redisTemplate.opsForHash();    // Hash 操作
redisTemplate.opsForSet();     // Set 操作
redisTemplate.opsForZSet();    // Zset 操作
```

### 键绑定器

绑定 key 后可进行一系列操作，无需重复指定 key：

```java
redisTemplate.boundValueOps(key);
redisTemplate.boundListOps(key);
redisTemplate.boundHashOps(key);
redisTemplate.boundSetOps(key);
redisTemplate.boundZSetOps(key);
```

### 序列化配置

推荐使用 `Jackson2JsonRedisSerializer` 或 `GenericJackson2JsonRedisSerializer`：

```java
@Configuration
public class UserRedisConfig {

    @Bean(value = "redisTemplate")
    public RedisTemplate<Object, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<Object, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(factory);

        StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();
        redisTemplate.setKeySerializer(stringRedisSerializer);
        redisTemplate.setHashKeySerializer(stringRedisSerializer);

        return redisTemplate;
    }
}
```

### 操作方法

#### 字符串操作

```java
// 设置键值对
redisTemplate.opsForValue().set("key", "value");

// 获取值
String value = redisTemplate.opsForValue().get("key");

// 设置键值对并设置过期时间
redisTemplate.opsForValue().set("key", "value", Duration.ofMinutes(10));

// 仅当键不存在时设置
redisTemplate.opsForValue().setIfAbsent("key", "value");

// 仅当键存在时设置
redisTemplate.opsForValue().setIfPresent("key", "value");

// 数值自增
redisTemplate.opsForValue().increment("key", 1);
```

#### 哈希操作

```java
// 设置哈希表中的字段值
redisTemplate.opsForHash().put("hashKey", "field", "value");

// 获取哈希表中的字段值
String hashValue = (String) redisTemplate.opsForHash().get("hashKey", "field");

// 获取哈希表中的所有字段值
Map<Object, Object> entries = redisTemplate.opsForHash().entries("hashKey");

// 删除哈希表中的字段
redisTemplate.opsForHash().delete("hashKey", "field");

// 判断哈希表中是否有该字段
boolean hasField = redisTemplate.opsForHash().hasKey("hashKey", "field");
```

#### 列表操作

```java
// 向列表右侧添加元素
redisTemplate.opsForList().rightPush("listKey", "value");

// 向列表左侧添加元素
redisTemplate.opsForList().leftPush("listKey", "value");

// 从列表右侧弹出元素
String rightPop = (String) redisTemplate.opsForList().rightPop("listKey");

// 从列表左侧弹出元素
String leftPop = (String) redisTemplate.opsForList().leftPop("listKey");

// 获取列表长度
Long size = redisTemplate.opsForList().size("listKey");

// 获取列表中的元素
List<String> range = redisTemplate.opsForList().range("listKey", 0, -1);

// 获取列表指定位置的元素
String indexValue = (String) redisTemplate.opsForList().index("listKey", 0);

// 修剪列表，只保留指定范围内的元素
redisTemplate.opsForList().trim("listKey", 0, 10);
```

#### 集合操作

```java
// 向集合中添加元素
redisTemplate.opsForSet().add("setKey", "value");

// 从集合中移除元素
redisTemplate.opsForSet().remove("setKey", "value");

// 获取集合中的所有元素
Set<String> members = redisTemplate.opsForSet().members("setKey");

// 判断集合中是否包含指定元素
boolean isMember = redisTemplate.opsForSet().isMember("setKey", "value");

// 获取两个集合的交集
Set<String> intersect = redisTemplate.opsForSet().intersect("setKey1", "setKey2");
```

#### 有序集合操作

```java
// 向有序集合中添加元素，指定分数
redisTemplate.opsForZSet().add("zsetKey", "value", 1.0);

// 从有序集合中移除元素
redisTemplate.opsForZSet().remove("zsetKey", "value");

// 获取有序集合中的所有元素（按分数排序）
Set<String> rangeZset = redisTemplate.opsForZSet().range("zsetKey", 0, -1);

// 获取有序集合中的所有元素及其分数
Set<ZSetOperations.TypedTuple<String>> rangeWithScores =
    redisTemplate.opsForZSet().rangeWithScores("zsetKey", 0, -1);

// 获取有序集合中指定分数范围内的元素
Set<String> rangeByScore = redisTemplate.opsForZSet().rangeByScore("zsetKey", 0, 10);
```

#### 通用操作

```java
// 删除键
redisTemplate.delete("key");

// 检查键是否存在
boolean hasKey = redisTemplate.hasKey("key");

// 设置键的过期时间
redisTemplate.expire("key", Duration.ofMinutes(10));

// 获取键的过期时间
Long expire = redisTemplate.getExpire("key");

// 重命名键
redisTemplate.rename("oldKey", "newKey");

// 获取所有键
Set<String> keys = redisTemplate.keys("*");
```
