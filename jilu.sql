/*
 Navicat Premium Data Transfer

 Source Server         : Cuizhibo
 Source Server Type    : MySQL
 Source Server Version : 80026
 Source Host           : localhost:3306
 Source Schema         : mianshi

 Target Server Type    : MySQL
 Target Server Version : 80026
 File Encoding         : 65001

 Date: 22/07/2025 20:02:39
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for jilu
-- ----------------------------
DROP TABLE IF EXISTS `jilu`;
CREATE TABLE `jilu`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `mode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '面试模式',
  `question_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '题目名',
  `video_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '面试视频名称',
  `video_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '视频URL',
  `ai_evaluation` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'AI评测结果',
  `score` int NULL DEFAULT NULL COMMENT '评分',
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '反馈建议',
  `interview_duration` int NULL DEFAULT NULL COMMENT '面试时长(秒)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_username`(`username` ASC) USING BTREE,
  INDEX `idx_mode`(`mode` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of jilu
-- ----------------------------
INSERT INTO `jilu` VALUES (6, '123', '自由练习模式', 'HDFS的工作原理和架构设计', '123_2025-07-22T11-12-24-972Z.mp4', 'http://8.148.69.25:5220/123_2025-07-22T11-12-24-972Z.mp4', '表达能力82分、逻辑思维86分、专业知识88分、应变能力80分、职业素养84分\n\n综合评价:候选人对推荐系统冷启动问题展现出扎实的技术功底。能够准确识别用户冷启动、物品冷启动、系统冷启动三类核心问题,并系统性地提出了基于内容过滤、协同过滤、混合推荐、知识图谱等多种解决方案。回答逻辑清晰,从问题定义到解决思路再到具体实现都有涉及。语音分析显示语调平稳,专业术语使用准确。微表情检测显示思考专注,眼神交流良好。在讨论A/B测试和效果评估时表现出较强的工程实践意识。\n\n改进建议:1.可以更多结合具体业务场景举例,如电商、视频、新闻等不同领域的冷启动策略差异;2.建议深入讨论冷启动效果的评估指标,如点击率提升、用户留存等;3.回答时可以更主动地询问具体业务背景,展现需求理解能力;4.在阐述技术方案时可以适当提及计算复杂度和工程实现难度的权衡。', 84, NULL, NULL, '2025-07-22 19:12:25', '2025-07-22 19:23:39');
INSERT INTO `jilu` VALUES (7, '123', '自由练习模式', '推荐系统冷启动问题', '123_2025-07-22T11-14-05-883Z.mp4', 'http://8.148.69.25:5220/123_2025-07-22T11-14-05-883Z.mp4', '表达能力85分、逻辑思维88分、专业知识80分、应变能力78分、职业素养85分\n\n综合评价：\n候选人对推荐系统冷启动问题展现了较好的技术理解能力。在回答中清晰地阐述了用户冷启动、物品冷启动和系统冷启动三个维度的问题，并提出了基于内容的推荐、协同过滤、知识图谱、用户画像构建等多种解决方案。语言表达流畅，逻辑结构清晰，专业术语使用准确。微表情显示思考过程自然，对问题有深入思考。在讨论具体实现细节时略显紧张，但整体表现稳定。\n\n改进建议：\n1. 可以更多结合实际业务场景举例说明，增强答案的实用性\n2. 在谈到技术方案时可以更详细地讨论各方案的优缺点和适用场景\n3. 建议增加对冷启动问题评估指标的讨论，如覆盖率、多样性等\n4. 表达时可以更加自信，减少\"嗯\"、\"这个\"等语气词的使用\n5. 可以主动询问面试官是否需要深入某个特定方向，展现更好的沟通能力', 82, NULL, NULL, '2025-07-22 19:14:05', '2025-07-22 19:19:35');
INSERT INTO `jilu` VALUES (8, '123', '专项训练模式', '大规模设备离线故障处理', '123_2025-07-22T11-22-58-461Z.mp4', 'http://8.148.69.25:5220/123_2025-07-22T11-22-58-461Z.mp4', '表达能力85分、逻辑思维90分、专业知识89分、应变能力84分、职业素养86分\n\n综合评价:候选人对大规模设备离线故障处理问题展现出优秀的系统性思维和丰富的运维经验。能够从故障发现、影响评估、应急响应、根因分析、恢复策略等多个维度系统阐述处理流程。技术深度表现突出,涉及监控告警体系、故障隔离机制、自动化运维工具、容灾切换等关键技术点。逻辑思维清晰,按照时间线和优先级进行分层处理。语音分析显示表达自信流畅,专业术语运用准确。微表情显示对问题理解深刻,在描述紧急处理流程时表现出良好的应急意识和决策能力。\n\n改进建议:1.可以更详细地描述故障等级分类和对应的处理SLA要求;2.建议补充跨部门协调沟通的具体流程和工具;3.可以结合具体案例说明批量设备故障的处理经验和教训;4.建议增加对故障预防机制的讨论,如预测性维护、设备健康度监控等;5.在描述技术方案时可以更多考虑成本效益和业务影响的平衡。', 87, NULL, NULL, '2025-07-22 19:22:58', '2025-07-22 19:31:22');

SET FOREIGN_KEY_CHECKS = 1;
