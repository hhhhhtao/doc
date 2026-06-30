# Java 笔记

## 时间戳（TimeStamp）

**Unix 时间戳（Unix Timestamp）**：从 1970 年 01 月 01 日 00 时 00 分 00 秒（UTC）起至现在经过的秒数。

`date.getTime()` 获取的是从 1970 年 01 月 01 日 00 时 00 分 00 秒至现在的**毫秒数**。

### 秒级与毫秒级时间戳

在 Java 中，`System.currentTimeMillis()` 获取的时间戳是以**毫秒**为单位的，需要除以 1000 转换为秒级时间戳。

```java
long currentTimestampInMillis = System.currentTimeMillis();  // 获取毫秒级时间戳
long currentTimestampInSeconds = currentTimestampInMillis / 1000;  // 转换为秒级时间戳
```

---

## SpringBoot 拦截器（HandlerInterceptor）

### 实现拦截器

```java
public class Interceptor implements HandlerInterceptor {

    /* 请求前拦截 */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        /* 查看是否登录 */
        User loginUser = (User) request.getSession().getAttribute("User");
        /* 如果是空那么跳转回登录页 */
        if (loginUser == null) {
            response.sendRedirect(request.getContextPath() + "/");
            return false;
        } else {
            return true;
        }
    }
}
```

### 注册拦截器

```java
@Configuration
public class LoginConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        /* 注册拦截器 */
        InterceptorRegistration registration = registry.addInterceptor(new Interceptor());
        /* 拦截所有的路径 */
        registration.addPathPatterns("/**");
        /* 不拦截的路径 */
        registration.excludePathPatterns("/");
    }
}
```

---

## FileWriter

```java
// 将新数据写入原文件数据的末尾
new FileWriter(file, true);

// 将新数据写入源文件数据的开始处
new FileWriter(file, false);

// 替换原文件的内容
new FileWriter(file);
```

---

## FileUtils

`FileUtils.readFileToString` 使用 VM 的默认编码将文件的内容读入字符串，该文件始终处于关闭状态。

```java
// file：文件对象，"UTF-8"：设定编码格式
FileUtils.readFileToString(file, "UTF-8");
```

---

## File.getAbsolutePath()

返回抽象路径名的绝对路径字符串。

```java
new File("").getAbsolutePath();
```

---

## 设置响应头以附件形式下载

```java
// 设置 content-disposition 响应头，通知浏览器以附件的形式下载处理
response.setHeader("Content-Disposition", "attachment;filename=" + fileName);
OutputStream out = response.getOutputStream();
```

---

## 获取当前服务器 IP 地址

```java
InetAddress address = InetAddress.getLocalHost();
address.getHostAddress();
```

---

## UUID

UUID 格式：**8-4-4-4-12**，不包括连字符共有 32 个字符，加上连字符一共 36 个字符。

### UUID 结构

| 名称 | 字节数 | 说明 |
|------|--------|------|
| `time_low` | 4 | 低位 32bits 时间 |
| `time_mid` | 2 | 中间位 16bits 时间 |
| `time_hi_and_version` | 2 | 最高有效位中的 4bits 版本 + 高 12bits 时间 |
| `clock_seq_hi_and_res` / `clock_seq_low` | 2 | 最高有效位 1-3bits 变体 + 13-15bits 时钟序列 |
| `node` | 6 | 48bits 节点 ID |

---

## LocalDateTime 与 Timestamp 互转

```java
// timestamp → localDateTime
public LocalDateTime timestampToDatetime(long timestamp) {
    Instant instant = Instant.ofEpochMilli(timestamp);
    return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
}

// localDateTime → timestamp
public long datetimeToTimestamp(LocalDateTime ldt) {
    long timestamp = ldt.toInstant(ZoneOffset.of("+8")).toEpochMilli();
    return timestamp;
}

// String → timestamp
LocalDateTime ldt = LocalDateTime.parse("2020-01-06 12:12:12",
    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:ss:mm"));
long timestamp = ldt.toInstant(ZoneOffset.of("+8")).toEpochMilli();
```

---

## 异常处理

### 异常分类

| 类型 | 说明 |
|------|------|
| **检查异常（Checked Exception）** | 程序要求必须处理，否则编译无法通过 |
| **非检查异常（Unchecked Exception）** | 不需要强制处理，发生在运行时，如 `NullPointerException`、`ClassCastException` |

### 规范使用 try-catch

**检查性错误**：

1. 如果明确知道如何处理异常（如捕获后执行回滚、重试等），可使用 `try...catch`
2. 如果不清楚当前异常如何处理，则直接 `throws`，交给调用层处理。不建议仅仅打印调用栈了事
3. 如果 try 的代码块与后续代码逻辑解耦，为了避免该部分异常导致程序崩溃退出，可将该部分进行 `try...catch`

**非检查性错误**：

1. 尽量使用条件判断代替可能的 `try...catch`
2. 避免将无关代码加入到 `try...catch` 体内
3. 不要滥用 `try...catch`，只对确定需要捕获的代码块进行处理，代码量越少越好，尤其不要嵌套

```java
try (/* 需要关闭的资源，可自动关闭 */) {

} catch () {

} finally {  // 如果有特殊需求，写在 finally 手动关闭会更灵活

}
```

---

## 常量类

### 规范与推荐

- 【推荐】接口类中的方法和属性不要加任何修饰符号（`public` 也不要加），保持代码的简洁性，并加上有效的 Javadoc 注释。尽量不要在接口里定义变量
- 【强制】不允许出现任何魔法值（即未经定义的常量）直接出现在代码中
- 【推荐】不要使用一个常量类维护所有常量，应按常量功能进行归类，分开维护（如 `CacheConsts`、`ConfigConsts`）
- 【推荐】常量的复用层次有五层：跨应用共享常量 → 应用内共享常量 → 子工程内共享常量 → 包内共享常量 → 类内共享常量
- 【强制】避免通过一个类的对象引用访问此类的静态变量或静态方法，直接用类名来访问即可

### 常量类定义示例

建议使用枚举类或常量类，尽量不在接口中定义。定义常量类应该使用 `public final class`，不允许被继承，构造函数使用 `private` 不允许被实例化。

```java
public final class Constants {
    private Constants() {}

    public static final int TRUE = 1;
    public static final int FALSE = 0;
}
```

### final 关键字特点

| 修饰目标 | 效果 |
|----------|------|
| 类 | 该类为常量类，不能被继承 |
| 方法 | 该方法为常量方法，不能被重写 |
| 基本类型属性 | 属性的值不能被改变，只能赋值一次 |
| 引用类型属性 | 属性的引用不能被改变，只能指向一次引用，但指向的对象内部值可以被改变 |

> 常量属性必须要赋值，可以在初始化时赋值，也可以在类的构造方法里面赋值。类的构造方法不能被 `final` 修饰。一个既被 `static` 修饰又被 `final` 修饰的域，是一个不可改变的内存空间。

---

## 枚举类

### 基本示例

```java
public enum Day {
    MONDAY(1, "星期一", "星期一各种不在状态"),
    TUESDAY(2, "星期二", "星期二依旧犯困"),
    WEDNESDAY(3, "星期三", "星期三感觉半周终于过去了"),
    THURSDAY(4, "星期四", "星期四期待这星期五"),
    FRIDAY(5, "星期五", "星期五感觉还不错"),
    SATURDAY(6, "星期六", "星期六感觉非常好"),
    SUNDAY(7, "星期日", "星期日感觉周末还没过够。。。");

    Day(int index, String name, String value) {
        this.index = index;
        this.name = name;
        this.value = value;
    }

    private int index;
    private String name;
    private String value;

    public int getIndex() { return index; }
    public String getName() { return name; }
    public String getValue() { return value; }
}
```

### 每个枚举值拥有各自的内部方法

```java
public enum Day {
    MONDAY(1, "星期一", "各种不在状态") {
        @Override
        public Day getNext() { return TUESDAY; }
    },
    TUESDAY(2, "星期二", "依旧犯困") {
        @Override
        public Day getNext() { return WEDNESDAY; }
    },
    WEDNESDAY(3, "星期三", "感觉半周终于过去了") {
        @Override
        public Day getNext() { return THURSDAY; }
    },
    THURSDAY(4, "星期四", "期待这星期五") {
        @Override
        public Day getNext() { return FRIDAY; }
    },
    FRIDAY(5, "星期五", "感觉还不错") {
        @Override
        public Day getNext() { return SATURDAY; }
    },
    SATURDAY(6, "星期六", "感觉非常好") {
        @Override
        public Day getNext() { return SUNDAY; }
    },
    SUNDAY(7, "星期日", "感觉周末还没过够。。。") {
        @Override
        public Day getNext() { return MONDAY; }
    };

    Day(int index, String name, String value) {
        this.index = index;
        this.name = name;
        this.value = value;
    }

    private int index;
    private String name;
    private String value;

    public abstract Day getNext();

    public int getIndex() { return index; }
    public String getName() { return name; }
    public String getValue() { return value; }
}
```

---

## 下载文件文件名乱码

```java
// 完整格式：attachment; filename="filename.xlsx"，所以请不要省略 \"
response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
    String.format("attachment; filename=\"%s.xlsx\"",
        URLEncoder.encode(filename, StandardCharsets.UTF_8)));
```

---

## 获取类字段（属性）方法

```java
// getDeclaredFields() 获取该类所有的字段，不获取父类的字段
Field[] objectFields = object.getClass().getDeclaredFields();

// getFields() 获取该类所有的公共字段和父类的所有公共字段
Field[] objectFields = object.getClass().getFields();
```

---

## for 和 foreach

| 遍历方式 | 特点 |
|----------|------|
| `for`（下标） | 顺序可控，但 `LinkedList` 不适合 `for` 循环，消耗巨大 |
| `foreach` | 底层使用迭代器，顺序无法保证 |

> 集合中存放的都是对象的引用，所以可以修改对象的属性，但无法删除对象本身。数组存放的都是基本类型，无法修改。

---

## Map 迭代 / 遍历

```java
// 第一种：普遍使用，二次取值
System.out.println("通过 Map.keySet 遍历 key 和 value：");
for (String key : map.keySet()) {
    System.out.println("key= " + key + " and value= " + map.get(key));
}

// 第二种：使用 iterator 遍历 entrySet
System.out.println("通过 Map.entrySet 使用 iterator 遍历 key 和 value：");
Iterator<Map.Entry<String, String>> it = map.entrySet().iterator();
while (it.hasNext()) {
    Map.Entry<String, String> entry = it.next();
    System.out.println("key= " + entry.getKey() + " and value= " + entry.getValue());
}

// 第三种：推荐，尤其是容量大时
System.out.println("通过 Map.entrySet 遍历 key 和 value");
for (Map.Entry<String, String> entry : map.entrySet()) {
    System.out.println("key= " + entry.getKey() + " and value= " + entry.getValue());
}

// 第四种：只能遍历 value
System.out.println("通过 Map.values() 遍历所有的 value，但不能遍历 key");
for (String v : map.values()) {
    System.out.println("value= " + v);
}
```

---

## StandardCharsets

在 `java.nio.charset` 包下：

```java
import java.nio.charset.StandardCharsets;
```

---

## UriComponentsBuilder

用于拼接 URL（Spring 提供的工具类）。

---

## Lambda 表达式

> 参考文章：[Lambda 表达式详解](https://mp.weixin.qq.com/s?__biz=MzAxOTQxOTc5NQ==&mid=2650498752&idx=1&sn=7dce3ed9be9a903a6dd70d3dae806add)

### 概述

**函数式接口（Functional Interface）**：接口里面必须有且只有一个抽象方法。在可以使用 Lambda 表达式的地方，方法声明时必须包含一个函数式的接口（Java 8 的接口可以有多个 `default` 方法）。

任何函数式接口都可以使用 Lambda 表达式替换，例如 `ActionListener`、`Comparator`、`Runnable`。

> Lambda 表达式只能出现在目标类型为函数式接口的上下文中。

### 写法与规则

#### 1. 类型推导

编译器负责推导 Lambda 表达式的类型，利用 Lambda 表达式所在上下文所期待的类型进行推导（即目标类型）。传入的参数可以无需写类型。

#### 2. 变量捕获

允许在 Lambda 表达式和内部类中捕获那些符合**有效只读（Effectively final）** 的局部变量。如果一个局部变量在初始化后从未被修改过，那么它就符合有效只读的要求。

> 和 `final` 关键字一样，指的是引用不可改。

#### 3. 方法引用

```java
Comparator byName = Comparator.comparing(Person::getName);
```

方法引用语法：

| 类型 | 语法 |
|------|------|
| 静态方法引用 | `ClassName::methodName` |
| 实例上的实例方法引用 | `instanceReference::methodName` |
| 超类上的实例方法引用 | `super::methodName` |
| 类型上的实例方法引用 | `ClassName::methodName` |
| 构造方法引用 | `Class::new` |
| 数组构造方法引用 | `TypeName[]::new` |

#### 4. Java 提供的 SAM 接口

Java SE 8 中增加了一个新的包：`java.util.function`，它包含了常用的函数式接口。

---

## synchronized 同步

`volatile` 关键字可以保证共享变量的可见性和有序性，但并不能保证原子性。如果想同时保证原子性，`synchronized` 关键字是一个不错的选择。

> `synchronized` 是一个**对象锁**，即锁的是一个对象。如果一个线程在访问对象的 `synchronized` 方法时，其他线程仍然可以访问非 `synchronized` 方法。

### 使用方式

#### 1. 修饰实例方法

锁的是方法所在实例的本身。

```java
public synchronized void add() {
    i++;
}
```

#### 2. 修饰静态方法

锁的是当前静态方法所在类的 `Class` 对象。

```java
public static synchronized void add() {
    i++;
}
```

#### 3. 修饰代码块

```java
public void add() {
    // 注意：如果方法是 static 的无法使用 this，此时可以使用 className.class
    synchronized (this) {
        i++;
    }
}
```

> 需要注意的是锁的是对象，如果创建了两个对象，那么就有两把锁，两个线程可以分别执行两个对象，导致没有"锁"住。

---

## 深浅拷贝

| 拷贝方式 | 说明 |
|----------|------|
| **浅拷贝** | 创建新对象，值类型字段直接复制，引用类型字段复制引用（原始对象和副本引用同一个对象） |
| **深拷贝** | 创建新对象，无论值类型还是引用类型都复制独立的一份，互不影响 |

`Object` 类提供的 `clone()` 只能实现浅拷贝。

### 深拷贝实现：序列化

```java
public static <T extends Serializable> T deepClone(T original) {
    try {
        // 将对象写入字节数组输出流
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(baos);
        oos.writeObject(original);

        // 从字节数组输入流中读取对象
        ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
        ObjectInputStream ois = new ObjectInputStream(bais);
        return (T) ois.readObject();
    } catch (Exception e) {
        e.printStackTrace();
        return null;
    }
}
```

---

## @Transactional 事务

### 失效的原因

#### 1. 同一个类中方法内部直接调用

因为底层使用的是代理，请确保最外层的方法有事务：

| 调用场景 | 事务是否生效 |
|----------|-------------|
| A 调 B，A 有事务，B 没有 | 事务生效 |
| A 调 B，A 没有，B 没有 | 事务不生效 |
| A 调 B，A 有，B 有 | 会利用 A 的事务进行回滚 |

#### 2. 不同类之间的调用

| 调用场景 | 效果 |
|----------|------|
| A 无事务，B 有事务 | B 出错误触发 B 的事务，A 出错误不回滚 |
| A 有事务，B 无事务 | A、B 出现错误都会回滚 |

#### 3. 不同的线程

如果两个方法不在同一个线程中，获取到的数据库连接不一样，从而是两个不同的事务。Spring 的事务是通过数据库连接来实现的，当前线程中保存了一个 map，key 是数据源，value 是数据库连接。

> 在不同的线程，拿到的数据库连接肯定是不一样的，所以是不同的事务。

### 7 种传播行为

| 传播行为 | 说明 |
|----------|------|
| `PROPAGATION_REQUIRED` | 支持当前事务，如果不存在则新建（默认） |
| `PROPAGATION_SUPPORTS` | 支持当前事务，如果不存在则以非事务方式执行 |
| `PROPAGATION_MANDATORY` | 支持当前事务，如果不存在则抛出异常 |
| `PROPAGATION_REQUIRES_NEW` | 新建事务，如果当前存在则挂起当前事务 |
| `PROPAGATION_NOT_SUPPORTED` | 以非事务方式执行，如果当前存在则挂起当前事务 |
| `PROPAGATION_NEVER` | 以非事务方式执行，如果当前存在则抛出异常 |
| `PROPAGATION_NESTED` | 如果当前存在事务，则在嵌套事务内执行 |

**关于子事务回滚**：
- 如果子事务回滚：父事务会回滚到进入子事务前建立的 save point，然后尝试其他事务或业务逻辑，父事务之前的操作不会受到影响
- 如果父事务回滚：子事务也会跟着回滚，因为父事务结束之前子事务不会提交
- 事务提交：子事务先提交，父事务再提交（子事务是父事务的一部分，由父事务统一提交）

### 5 个隔离级别

| 隔离级别 | 说明 |
|----------|------|
| `ISOLATION_DEFAULT` | 使用底层数据存储的默认隔离级别（默认） |
| `ISOLATION_READ_UNCOMMITTED` | 读未提交（脏读、不可重复读和幻读可能发生） |
| `ISOLATION_READ_COMMITTED` | 读已提交（禁止脏读，不可重复读和幻读可能发生） |
| `ISOLATION_REPEATABLE_READ` | 可重复读（防止脏读和不可重复读，幻读可能发生） |
| `ISOLATION_SERIALIZABLE` | 序列化（脏读、不可重复读和幻读都不会发生） |

---

## 内部类

### 内部类分类

| 类型 | 说明 |
|------|------|
| **成员内部类** | 定义在类内部的普通类，与外部类的实例相关联 |
| **静态内部类** | 使用 `static` 修饰，与外部类的实例无关，可直接通过外部类名访问 |
| **局部内部类** | 定义在方法内部的类，只能在方法内部使用 |
| **匿名内部类** | 没有名字的内部类，通常用于创建临时对象或实现接口 |

### 成员内部类

成员内部类属于外部类的成员，可以访问外部类的所有成员（包括私有成员）。

```java
public class OuterClass {
    private int outerField;

    public class InnerClass {
        public void display() {
            System.out.println("Outer field value: " + outerField);
        }
    }

    public void testInnerClass() {
        InnerClass inner = new InnerClass();
        inner.display();
    }
}
```

### 静态内部类

静态内部类不依赖于外部类的实例，可以直接通过外部类名访问。

```java
public class OuterClass {
    private static int staticOuterField;

    public static class StaticInnerClass {
        public void display() {
            System.out.println("Static outer field value: " + staticOuterField);
        }
    }

    public void testStaticInnerClass() {
        StaticInnerClass staticInner = new StaticInnerClass();
        staticInner.display();
    }
}
```

### 局部内部类

局部内部类只在该方法中有效，可以访问方法的局部变量和参数，但必须是 `final` 或 effectively final 的。

```java
public class OuterClass {
    public void testLocalInnerClass() {
        final int localVar = 10;  // 局部变量
        class LocalInnerClass {
            public void display() {
                System.out.println("Local variable value: " + localVar);
            }
        }
        LocalInnerClass localInner = new LocalInnerClass();
        localInner.display();
    }
}
```

### 匿名内部类

匿名内部类没有显式的类名，通常用于创建接口或抽象类的实例。因为没有名字，所以只能使用一次，通常用来简化代码编写。

> 使用匿名内部类的前提条件：必须继承一个父类或实现一个接口。

**格式**：

```java
new 父类名或者接口名() {
    // 方法重写
    @Override
    public void method() {
        // 执行语句
    }
};
```

**示例**：

```java
public interface Greeting {
    void greet();
}

public class OuterClass {
    public void testAnonymousInnerClass() {
        Greeting greeting = new Greeting() {
            @Override
            public void greet() {
                System.out.println("Hello from anonymous inner class!");
            }
        };
        greeting.greet();
    }
}
```

---

## 泛型

泛型即"参数化类型"。泛型的本质是为了参数化类型（在不创建新的类型的情况下，通过泛型指定的不同类型来控制形参具体限制的类型）。泛型可以用在类、接口和方法中，分别被称为**泛型类**、**泛型接口**、**泛型方法**。

### 特性

> 泛型只在编译阶段有效。在编译之后程序会采取**去泛型化**的措施。泛型类型在逻辑上可以看成是多个不同的类型，实际上都是相同的基本类型。

### 泛型类

泛型类型用于类的定义中，被称为泛型类。最典型的就是各种容器类，如 `List`、`Set`、`Map`。

```java
// 此处 T 可以随便写为任意标识，常见的如 T、E、K、V 等
public class Generic<T> {
    // key 这个成员变量的类型为 T，T 的类型由外部指定
    private T key;

    // 泛型构造方法形参 key 的类型也为 T
    public Generic(T key) {
        this.key = key;
    }

    // 泛型方法 getKey 的返回值类型为 T
    public T getKey() {
        return key;
    }
}
```

**使用示例**：

```java
// 泛型的类型参数只能是类类型（包括自定义类），不能是简单类型
Generic<Integer> genericInteger = new Generic<Integer>(123456);
Generic<String> genericString = new Generic<String>("key_value");

System.out.println("key is " + genericInteger.getKey());
System.out.println("key is " + genericString.getKey());
```

**注意**：

- 定义的泛型类，就一定要传入泛型类型实参么？**并不是**。如果不传入泛型类型实参的话，在泛型类中使用泛型的方法或成员变量定义的类型可以为任何的类型。
- 泛型的类型参数只能是**类类型**，不能是简单类型。
- 不能对确切的泛型类型使用 `instanceof` 操作。

```java
// 编译时会出错
if (ex_num instanceof Generic<Number>) {
}
```

### 泛型接口

泛型接口常被用在各种类的生产器中。

```java
// 定义一个泛型接口
public interface Generator<T> {
    public T next();
}
```

**实现方式一**：未传入泛型实参时，声明类时需将泛型声明也一起加到类中。

```java
class FruitGenerator<T> implements Generator<T> {
    @Override
    public T next() {
        return null;
    }
}
```

**实现方式二**：传入泛型实参时，所有使用泛型的地方都要替换成传入的实参类型。

```java
public class FruitGenerator implements Generator<String> {

    private String[] fruits = new String[]{"Apple", "Banana", "Pear"};

    @Override
    public String next() {
        Random rand = new Random();
        return fruits[rand.nextInt(3)];
    }
}
```

### 泛型通配符

`Generic<Integer>` 不能被看作为 `Generic<Number>` 的子类。不同参数类型的泛型实例之间互不兼容。

通配符 `?` 由此而生：

```java
public void showKeyValue1(Generic<?> obj) {
    System.out.println("key value is " + obj.getKey());
}
```

> `?` 是**类型实参**，而不是类型形参。可以把 `?` 看成所有类型的父类。当具体类型不确定时，使用 `?` 通配符来表示未知类型。

### 泛型方法

泛型类是在实例化类的时候指明泛型的具体类型；泛型方法是在**调用方法的时候**指明泛型的具体类型。

```java
/**
 * 泛型方法的基本介绍
 * @param tClass 传入的泛型实参
 * @param <T> 声明此方法为泛型方法
 * @return T 返回值为 T 类型
 *
 * 说明：
 * 1. public 与返回值中间 <T> 非常重要，可以理解为声明此方法为泛型方法
 * 2. 只有声明了 <T> 的方法才是泛型方法，泛型类中使用了泛型的成员方法并不是泛型方法
 * 3. <T> 表明该方法将使用泛型类型 T，此时才可以在方法中使用泛型类型 T
 */
public <T> T genericMethod(Class<T> tClass) throws InstantiationException, IllegalAccessException {
    T instance = tClass.newInstance();
    return instance;
}
```

**泛型类中的泛型方法示例**：

```java
public class GenericTest {

    public class Generic<T> {
        private T key;

        public Generic(T key) {
            this.key = key;
        }

        // 这不是一个泛型方法，只是一个普通成员方法，使用了类上声明的泛型 T
        public T getKey() {
            return key;
        }
    }

    // 这才是一个真正的泛型方法
    public <T> T showKeyName(Generic<T> container) {
        System.out.println("container key :" + container.getKey());
        T test = container.getKey();
        return test;
    }

    // 这不是泛型方法，只是使用了 Generic<Number> 做形参的普通方法
    public void showKeyValue1(Generic<Number> obj) {
        System.out.println("key value is " + obj.getKey());
    }

    // 这不是泛型方法，只是使用了泛型通配符 ?
    public void showKeyValue2(Generic<?> obj) {
        System.out.println("key value is " + obj.getKey());
    }
}
```

**泛型类中的泛型方法（不同类型参数）**：

```java
class GenerateTest<T> {
    public void show_1(T t) {
        System.out.println(t.toString());
    }

    // 泛型方法使用泛型 E，可以为任意类型，可以与 T 相同或不同
    public <E> void show_3(E t) {
        System.out.println(t.toString());
    }

    // 泛型方法使用泛型 T，这是一个全新的类型，与泛型类中声明的 T 不是同一种类型
    public <T> void show_2(T t) {
        System.out.println(t.toString());
    }
}

public static void main(String[] args) {
    Apple apple = new Apple();
    Person person = new Person();

    GenerateTest<Fruit> generateTest = new GenerateTest<Fruit>();
    generateTest.show_1(apple);      // apple 是 Fruit 的子类，可以
    // generateTest.show_1(person);  // 编译错误

    generateTest.show_2(apple);      // 成功
    generateTest.show_2(person);     // 成功
    generateTest.show_3(apple);      // 成功
    generateTest.show_3(person);     // 成功
}
```

### 静态方法与泛型

> 静态方法无法访问类上定义的泛型。如果静态方法要使用泛型，必须将静态方法也定义成泛型方法。

```java
public class StaticGenerator<T> {

    /**
     * 静态方法要使用泛型，需要添加额外的泛型声明
     * 即使静态方法要使用泛型类中已经声明过的泛型也不可以
     */
    public static <T> void show(T t) {

    }
}
```

### 泛型上下边界

为泛型添加上边界，即传入的类型实参必须是指定类型的子类型。

**泛型通配符的上边界**：

```java
public void showKeyValue1(Generic<? extends Number> obj) {
    System.out.println("key value is " + obj.getKey());
}

// String 不是 Number 的子类，以下代码编译错误
// showKeyValue1(generic1);

// Integer、Float、Double 都是 Number 的子类，可以
showKeyValue1(generic2);
showKeyValue1(generic3);
showKeyValue1(generic4);
```

**泛型方法的上边界**：

```java
// 必须在权限声明与返回值之间的 <T> 上添加上下边界
public <T extends Number> T showKeyName(Generic<T> container) {
    System.out.println("container key :" + container.getKey());
    T test = container.getKey();
    return test;
}
```

**泛型类的上边界**：

```java
public class Generic<T extends Number> {
    private T key;

    public Generic(T key) {
        this.key = key;
    }

    public T getKey() {
        return key;
    }
}
```

### 泛型数组

Java 不允许直接创建确切的泛型类型数组。

```java
// 不允许：编译错误
List<String>[] ls = new ArrayList<String>[10];

// 允许：使用通配符
List<?>[] ls = new ArrayList<?>[10];

// 允许：使用原始类型
List<String>[] ls = new ArrayList[10];
```

**为什么不允许**？由于 JVM 泛型的擦除机制，在运行时 JVM 不知道泛型信息。如果可以声明泛型数组，会导致取出数据时出现 `ClassCastException`。对泛型数组的声明进行限制，可以在编译期提示代码有类型安全问题。

---

## 异步

> 待补充...
