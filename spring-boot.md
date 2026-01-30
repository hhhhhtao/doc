# spring-boot

## 常用logback-spring.xml模板
如果不需要在dev模式下也生成log文件的话可以在项目启动的时候指定prod，并且文件名加上prod结尾（logback-spring-prod.xml），就不会在dev模式下生成log。
> 为什么要这样命名？
> 因为spring会默认读取logback-spring.xml命名的配置，导致dev模式也会生成。

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!-- 根节点 -->
<configuration>

    <!-- 日志文件存储位置，不使用相对路径 -->
    <property name="LOG_PATH" value="" />
    <!-- 日志文件名 -->
    <property name="LOG_NAME" value="" />

    <!--控制台日志， 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
            <!--格式化输出：%d表示日期，%thread表示线程名，%-5level：级别从左显示5个字符宽度，%logger{50}: 日志信息所属类的全名，%msg：日志消息，%n是换行符-->
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 滚动记录日志文件 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 发生滚动时的行为-->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- 日志文件输出的文件名 -->
            <fileNamePattern>${LOG_PATH}/${LOG_NAME}.%d.log</fileNamePattern>
            <!-- 文件保留天数 -->
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <!--格式化输出：%d表示日期，%thread表示线程名，%-5level：级别从左显示5个字符宽度，%logger{50}: 日志信息所属类的全名，%msg：日志消息，%n是换行符-->
        <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
        </encoder>
    </appender>

    <root level="info">
        <appender-ref ref="CONSOLE" />
        <appender-ref ref="FILE" />
    </root>

</configuration>
```

## 常用spring-boot依赖
### spring-boot父依赖
管理spring-boot需要的所有依赖版本，起到约束版本的作用，当然也可以自行指定版本覆盖
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
</dependency>
```

### spring-boot-web应用
内含spring-boot核心启动器，spring-boot的配置日志，tomcat，spring-boot-webmvc等。
> spring-boot-starter-web是一个依赖库，Spring Boot 是在 Spring 的基础上创建的一个开原框架，它提供了 spring-boot-starter-web （web场景启动器）来为web开发予以支持。spring-boot-starter-web 为什么提供了嵌入的Servlet容器以及SpringMVC提供了大量自动配置，可以适用于大多数web开发场景。
只要我们在Spring Boot 项目中的 pom.xml 中引入了spring-boot-starter-web依赖，即使不进行任何配置，也可以使用Spring MVC 进行 Web 开发。Spring Web的启动程序使用Spring MVC, REST和Tomcat作为默认的嵌入式服务器。单个spring-boot-starter-web依赖关系可传递地获取与Web开发相关的所有依赖关系。它还减少了构建依赖项计数。
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### lombok
```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```