# 概述

Spring 最核心的是 **IOC**（控制反转 Inversion of Control）和 **AOP**（面向切面编程 Aspect Oriented Programming）。

# 启动流程

| 阶段 | 说明 |
|------|------|
| 构建 `SpringApplication` | 创建启动引导器，根据是否是 Web 应用确定创建类型 |
| 推断主类 | 根据 `main()` 方法所在类作为入口类 |
| 准备环境 | 读取 `application.properties/yml`，构建 `Environment` |
| 打印 Banner | 控制台打印启动 Banner |
| 创建容器 | 创建 Spring 容器（Web 应用一般是 `AnnotationConfigServletWebServerApplicationContext`） |
| 准备 BeanFactory | 注册 BeanDefinition，初始化单例 Bean |
| 执行自动配置 | 根据 classpath 和配置项自动注入组件（比如 Tomcat、DataSource） |
| 调用 Runner 接口 | 如果有实现 `CommandLineRunner` 或 `ApplicationRunner`，此时执行 |
| 启动完成 | Spring 容器初始化完毕，发出 `ApplicationReadyEvent`，项目准备好接受请求 |

# 细节

## `@Resource` 是在什么时候将 Bean 注入到类中的

### 1. BeanDefinition 阶段（扫描、解析）

- Spring 在 `@ComponentScan` 或 XML 配置下，扫描类并生成 BeanDefinition，只是记录这个类的信息（如类名、作用域、依赖字段等）。
- 此阶段不会实例化 bean，也不会注入依赖。
- 也不会先去创建 `@Resource` 依赖的目标 Bean。

### 2. 实例化阶段（Instantiation）

- Spring 根据 `BeanDefinition` 创建 Bean 的原始实例（通过构造函数或工厂方法）。
- 此时依赖尚未注入，Bean 只是创建了出来。

### 3. 依赖注入阶段（Populate）

- 此阶段是关键：Spring 会使用一系列 `BeanPostProcessor`（特别是 `CommonAnnotationBeanPostProcessor`）对 Bean 的字段进行扫描。
- 遇到 `@Resource` 注解，Spring 会：
  a. 解析这个注解所标注的字段或 setter；
  b. 根据名字或类型查找目标 Bean（先按 name 再按 type）；
  c. 如果依赖 Bean 尚未创建，就会优先创建这个依赖的 Bean；
  d. 注入这个依赖。

### 4. 初始化阶段（Initializing）

- 调用 `@PostConstruct` 或实现的 `InitializingBean.afterPropertiesSet()` 等初始化方法。

### 5. Bean 准备好（可用）

---

## Bean 初始化前和初始化后

### 1. 实现 `BeanPostProcessor` 接口（最常用）

`BeanPostProcessor` 是 Spring 容器级的扩展点，可以对所有 Bean 在初始化前后进行统一处理。

```java
@Component
public class MyBeanPostProcessor implements BeanPostProcessor {

    // 初始化前
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        System.out.println(beanName + " 初始化前处理");
        return bean;
    }

    // 初始化后
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        System.out.println(beanName + " 初始化后处理");
        return bean;
    }
}
```

- **作用范围**：对所有 Bean 生效
- **常见用途**：AOP、自动代理、属性注入、日志等

### 2. Bean 自身定义初始化方法

#### 2.1 实现 `InitializingBean` 接口

```java
@Component
public class MyBean implements InitializingBean {
    @Override
    public void afterPropertiesSet() throws Exception {
        // Bean 初始化后执行
        System.out.println("MyBean 初始化后执行");
    }
}
```

#### 2.2 使用 `@PostConstruct` 注解

```java
@Component
public class MyBean {
    @PostConstruct
    public void init() {
        // Bean 初始化后执行
        System.out.println("MyBean @PostConstruct 初始化后执行");
    }
}
```

#### 2.3 指定 `init-method` 属性

```java
@Bean(initMethod = "customInit")
public MyBean myBean() {
    return new MyBean();
}

public class MyBean {
    public void customInit() {
        // Bean 初始化后执行
    }
}
```

### 3. Bean 销毁前自定义方法（补充）

- 实现 `DisposableBean` 接口
- 使用 `@PreDestroy` 注解
- 指定 `destroyMethod` 属性

### 总结

| 方式 | 说明 |
|------|------|
| `BeanPostProcessor` | 可以对所有 Bean 的初始化前后进行统一处理（最强大、最常用） |
| `@PostConstruct` / `InitializingBean` / `init-method` | 只对当前 Bean 的初始化后进行处理 |
| 销毁前 | 对应的有 `@PreDestroy`、`DisposableBean`、`destroyMethod` |

---

## Bean 的生命周期

Spring 容器可以管理 **singleton** 作用域 Bean 的生命周期，在此作用域下，Spring 能够精确地知道该 Bean 何时被创建，何时初始化完成，以及何时被销毁。而对于 **prototype** 作用域的 Bean，Spring 只负责创建，当容器创建了 Bean 的实例后，Bean 的实例就交给客户端代码管理，Spring 容器将不再跟踪其生命周期。

了解 Spring 生命周期的意义就在于，可以利用 Bean 在其存活期间的指定时刻完成一些相关操作。一般情况下，会在 Bean **被初始化后**和**被销毁前**执行一些相关操作。

Bean 生命周期的整个执行过程描述如下：

1. **实例化 Bean**：根据配置情况调用 Bean 构造方法或工厂方法实例化 Bean。
2. **依赖注入**：利用依赖注入完成 Bean 中所有属性值的配置注入。
3. **`BeanNameAware`**：如果 Bean 实现了 `BeanNameAware` 接口，则 Spring 调用 `setBeanName()` 方法传入当前 Bean 的 id 值。
4. **`BeanFactoryAware`**：如果 Bean 实现了 `BeanFactoryAware` 接口，则 Spring 调用 `setBeanFactory()` 方法传入当前工厂实例的引用。
5. **`ApplicationContextAware`**：如果 Bean 实现了 `ApplicationContextAware` 接口，则 Spring 调用 `setApplicationContext()` 方法传入当前 `ApplicationContext` 实例的引用。
6. **`postProcessBeforeInitialization`**：如果 `BeanPostProcessor` 和 Bean 关联，则 Spring 将调用该接口的预初始化方法对 Bean 进行加工操作，此处非常重要，Spring 的 AOP 就是利用它实现的。
7. **`InitializingBean`**：如果 Bean 实现了 `InitializingBean` 接口，则 Spring 将调用 `afterPropertiesSet()` 方法。
8. **`init-method`**：如果在配置文件中通过 `init-method` 属性指定了初始化方法，则调用该初始化方法。
9. **`postProcessAfterInitialization`**：如果 `BeanPostProcessor` 和 Bean 关联，则 Spring 将调用该接口的初始化方法 `postProcessAfterInitialization()`。此时，Bean 已经可以被应用系统使用了。
10. **作用范围处理**：如果 Bean 的作用范围为 `scope="singleton"`，则将该 Bean 放入 Spring IoC 的缓存池中，触发 Spring 对该 Bean 的生命周期管理；如果作用范围为 `scope="prototype"`，则将该 Bean 交给调用者，调用者管理该 Bean 的生命周期，Spring 不再管理。
11. **销毁 Bean**：如果 Bean 实现了 `DisposableBean` 接口，则 Spring 会调用 `destroy()` 方法将 Bean 销毁；如果在配置文件中通过 `destroy-method` 属性指定了销毁方法，则 Spring 将调用该方法进行销毁。

> Spring 为 Bean 提供了细致全面的生命周期过程，通过实现特定的接口或 `<bean>` 的属性设置，都可以对 Bean 的生命周期过程产生影响。虽然可以随意配置，但建议不要过多地使用 Bean 实现接口，因为这样会导致代码和 Spring 的聚合过于紧密。

---

## 通过构造器进行依赖注入

### 构造器注入的优势

- 依赖不可变，更安全，便于单元测试。
- 强制依赖，Bean 创建时必须提供依赖，避免了依赖缺失。
- 更适合与 `final` 修饰符配合，保证依赖不被修改。
- 便于实现"只读"对象。

### 示例

```java
@Component
public class OrderService {

    private final UserService userService;

    // 构造器注入
    @Autowired // Spring 4.3+ 如果只有一个构造器，可以省略
    public OrderService(UserService userService) {
        this.userService = userService;
    }

    public void createOrder() {
        userService.doSomething();
    }
}
```

### 构造器注入的工作原理

**问题**：如果使用构造器注入且只有一个有参构造，直接 `new` 会报错，Spring 是怎么找到需要注入的参数的？

#### 1. 普通 Java 的 `new` 行为

如果你直接用 `new` 创建一个只有有参构造器的类，必须手动传入参数，否则编译报错。

```java
public class OrderService {
    public OrderService(UserService userService) { ... }
}
// 这样写会报错
// OrderService orderService = new OrderService();
```

#### 2. Spring 是怎么做的？

Spring 容器在创建 Bean 时，不会直接用 `new`，而是通过**反射机制**，并且会自动解析构造器参数的依赖。

**具体流程**：

1. **扫描 Bean 定义**：Spring 启动时会扫描所有的 Bean 定义，记录每个 Bean 的构造器信息和依赖类型。
2. **分析构造器参数**：当需要创建某个 Bean（如 `OrderService`）时，Spring 会检查它的构造器参数（如 `UserService`）。
3. **查找依赖 Bean**：Spring 会在容器中查找类型为 `UserService` 的 Bean，如果找到了，就作为参数传入。
4. **通过反射调用构造器**：Spring 用反射调用 `OrderService(UserService userService)` 构造器，把上一步找到的 `UserService` 实例传进去，完成实例化。
5. **递归处理依赖**：如果 `UserService` 还依赖其他 Bean，Spring 会递归地先创建这些依赖。

**伪代码流程**：

```java
for (BeanDefinition beanDef : beanFactory.getBeanDefinitions()) {
    Constructor<?> constructor = beanDef.getConstructor();
    Class<?>[] paramTypes = constructor.getParameterTypes();
    Object[] params = new Object[paramTypes.length];
    for (int i = 0; i < paramTypes.length; i++) {
        params[i] = beanFactory.getBean(paramTypes[i]); // 递归查找依赖
    }
    Object bean = constructor.newInstance(params); // 反射实例化
}
```

#### 3. 总结

- Spring 通过**反射机制**和**依赖查找**，自动为构造器参数注入所需的 Bean。
- 你不用手动 `new`，Spring 会自动帮你把依赖准备好并传入构造器。
- 这就是为什么构造器注入可以让依赖"自动到位"，而不用你手动传递参数。

---

## Spring 的三级缓存

### 三级缓存的结构

| 缓存 | 名称 | 类型 | 说明 |
|------|------|------|------|
| 一级缓存 | `singletonObjects` | `Map<String, Object>` | 存放完全初始化好的单例 Bean |
| 二级缓存 | `earlySingletonObjects` | `Map<String, Object>` | 存放早期暴露的 Bean（还未完成依赖注入，只是实例化了对象） |
| 三级缓存 | `singletonFactories` | `Map<String, ObjectFactory<?>>` | 存放能够生成早期 Bean 对象的工厂（ObjectFactory），用于创建代理对象等 |

### 三级缓存的工作流程

假设有两个 Bean：**A** 和 **B**，A 依赖 B，B 又依赖 A。

1. **A 开始创建**
   - Spring 实例化 A（调用构造方法），此时 A 还未注入属性。
   - 将 A 的 `ObjectFactory` 放入三级缓存（`singletonFactories`）。

2. **A 注入属性时发现需要 B**
   - Spring 发现 A 依赖 B，开始创建 B。
   - 实例化 B，将 B 的 `ObjectFactory` 放入三级缓存。

3. **B 注入属性时发现需要 A**
   - Spring 发现 B 依赖 A，尝试获取 A。
   - 发现 A 还未初始化完成，但 A 的 `ObjectFactory` 在三级缓存中。
   - 通过 `ObjectFactory` 获取 A 的早期引用（可能是 A 的代理对象），并放入二级缓存（`earlySingletonObjects`）。
   - 这样 B 就能注入 A 的早期引用，**避免了死循环**。

4. **B 初始化完成**
   - B 完成依赖注入，放入一级缓存（`singletonObjects`），并从二级、三级缓存移除。

5. **A 继续完成初始化**
   - A 继续完成依赖注入（此时 B 已经可用），最终 A 也放入一级缓存，并从二级、三级缓存移除。

### 三级缓存的意义

| 缓存 | 作用 |
|------|------|
| 三级缓存 | 允许 Bean 在还未完全初始化时就能被其他 Bean 引用，**解决了循环依赖的问题** |
| 二级缓存 | 存放已经通过 `ObjectFactory` 创建出来的早期 Bean 引用，**避免重复创建** |
| 一级缓存 | 存放完全初始化好的 Bean，**正常使用** |

---

## `earlyProxyReferences` 的作用

`earlyProxyReferences` 是 Spring 5.x 之后引入的一个机制，主要用于 AOP 代理和循环依赖的协同处理。

### 1. `earlyProxyReferences` 是什么？

`earlyProxyReferences` 是 Spring 容器中的一个 Map（如 `DefaultSingletonBeanRegistry` 里的 `earlyProxyReferences` 字段），它的作用是记录哪些 Bean 在创建过程中已经被**提前暴露为代理对象**。

### 2. 为什么需要 `earlyProxyReferences`？

**背景问题**：

- 传统三级缓存机制，提前暴露的是"原始对象"。
- 但如果 Bean 需要被 AOP 代理（如 `@Transactional` / `@Async`），提前暴露原始对象会导致依赖方拿到的不是代理对象，AOP 失效。
- Spring 5.x 之前，遇到这种情况会直接报错，防止功能异常。

**Spring 5.x 的优化**：

- 引入了 `earlyProxyReferences`，允许在某些情况下提前暴露**代理对象**，而不是原始对象。
- 这样，依赖方注入的就是代理对象，AOP 能正常生效。

### 3. 工作流程

1. **Bean 创建早期阶段**：Spring 检查 Bean 是否需要 AOP 代理。如果需要，会通过 `getEarlyBeanReference` 方法，提前生成代理对象，并记录到 `earlyProxyReferences`。
2. **依赖方注入时**：如果依赖方需要注入该 Bean，Spring 会优先从 `earlyProxyReferences` 里获取代理对象。这样，依赖方拿到的就是代理对象，而不是原始对象。
3. **Bean 初始化完成后**：Spring 会将最终的代理对象放入一级缓存（`singletonObjects`），并清理 `earlyProxyReferences`。

### 4. 代码片段（伪代码）

```java
// 创建 Bean A
if (需要AOP代理) {
    Object proxy = createAopProxy(bean);
    earlyProxyReferences.put(beanName, proxy);
    // 依赖方注入时，优先注入 proxy
}
```

### 5. 注意事项

- `earlyProxyReferences` 只在特定场景下使用（如 AOP 代理 + 循环依赖）。
- 不是所有 Bean 都会用到它，只有需要提前暴露代理对象时才会用。
- 这个机制是 Spring 5.x 之后的优化，提升了 AOP 和循环依赖的兼容性，但并不是所有循环依赖 + AOP 场景都能解决，复杂情况下仍可能报错。

---

# 事务

Spring Boot（实际上是 Spring Framework）事务的"传播行为"有 **7 种**，通过 `@Transactional(propagation = ...)` 注解参数进行设置。每种传播行为都决定了当前方法在调用时，遇到已有事务时的处理方式。

## 传播行为详解

### 1. `Propagation.REQUIRED`（默认）

- **作用**：如果当前存在事务，则加入当前事务；如果没有事务，则新建一个事务。
- **场景**：绝大多数业务场景的默认选择。
- **举例**：A 方法有事务，B 方法（REQUIRED）被 A 调用，B 参与 A 的事务。

### 2. `Propagation.SUPPORTS`

- **作用**：如果当前存在事务，则加入事务；如果没有事务，则以非事务方式运行。
- **场景**：有事务就用，没有事务也无所谓。
- **举例**：A 方法无事务，B 方法（SUPPORTS）被 A 调用，B 就没有事务。

### 3. `Propagation.MANDATORY`

- **作用**：必须在一个已有事务中运行，否则抛出异常。
- **场景**：强制要求调用方必须有事务。
- **举例**：A 方法无事务，B 方法（MANDATORY）被 A 调用，抛异常。

### 4. `Propagation.REQUIRES_NEW`

- **作用**：总是新建一个事务。如果当前存在事务，则把当前事务挂起。
- **场景**：需要一个独立的事务，互不影响。
- **举例**：A 方法有事务，B 方法（REQUIRES_NEW）被 A 调用，B 用自己的新事务，A/B 互不影响。

### 5. `Propagation.NOT_SUPPORTED`

- **作用**：以非事务方式运行。如果当前存在事务，则挂起当前事务。
- **场景**：明确要求不在事务中运行。
- **举例**：A 方法有事务，B 方法（NOT_SUPPORTED）被 A 调用，B 没有事务，A 的事务被挂起。

### 6. `Propagation.NEVER`

- **作用**：以非事务方式运行，如果当前存在事务，则抛出异常。
- **场景**：强制要求不能有事务。
- **举例**：A 方法有事务，B 方法（NEVER）被 A 调用，抛异常。

### 7. `Propagation.NESTED`

- **作用**：如果当前存在事务，则在嵌套事务内执行（使用保存点 Savepoint）；如果没有事务，则新建一个事务。
- **场景**：需要部分回滚的场景（依赖底层数据库支持）。
- **举例**：A 方法有事务，B 方法（NESTED）被 A 调用，B 在 A 的事务内有自己的保存点，B 回滚不影响 A 其他操作。

## 传播行为总结表

| 传播类型 | 作用说明 | 常见场景 / 备注 |
|----------|----------|-----------------|
| `REQUIRED` | 有事务加入，无则新建（**默认**） | 绝大多数业务 |
| `SUPPORTS` | 有事务用，无事务非事务 | 可有可无 |
| `MANDATORY` | 必须有事务，否则异常 | 强制要求有事务 |
| `REQUIRES_NEW` | 总是新建事务，挂起当前事务 | 独立事务，互不影响 |
| `NOT_SUPPORTED` | 以非事务方式运行，挂起当前事务 | 明确不需要事务 |
| `NEVER` | 以非事务方式运行，有事务则异常 | 强制不能有事务 |
| `NESTED` | 嵌套事务（保存点），无事务则新建 | 局部回滚，需 DB 支持 |
