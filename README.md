# react-variable-list
react/虚拟列表/无限滚动

单体结构-》垂直架构-》SOA架构-》微服务架构
单体结构；cs 模式、一个开发人员管数据库
垂直架构:BS模式。系统采用MVC模式-》衍生出前端  后端，缺点就是大系统项目包也很大，升级切换时间很漫长
SOA架构:由最基本的单元 ，EAI集成模式，可以实现界面继承 数据集成等等，作用是两两打通。如果直接使用对接工作量很大，100个系统，那就是100*99除以2  那就需要5千次，于是就SOA架构，关注每个系统对外能力，提取出来 集中到ESB上。互联网发展智能手机也要访问系统，因此不利于高耦合运用。
微服务架构：谁提出的？不同系统部署不同服务机器上，也就是分布式
============================
v1->单体。考验电脑硬件以及数据库能力，用户电脑几年甚至几十年都不升级
v2->垂直。B/S模型，后端开始spring 
v3->SOA.面向服务建设企业IU生态系统。全部注册到ESB(需要SDK代理调用，直接增强).各个系统全部走ESB，很容易实现容器监控
v4-》微服务.分布式服务化，容器化 服务治理。系统A-X,B-Y,C-Z  6个系统都是需要通过注册中心找到对方，后续只需要A直接请求x.语言也不限制，各个系统不限制。
