const FIGURES=[{"id":1,"file":"001_dataset_yearly_scale.png","chapter":"第四章 描述性分析","title":"论文数据规模随年份变化","description":"该图从时间维度呈现论文数据规模随年份变化，用于识别样本增长、影响积累窗口及不同年份之间的结构差异。解释近期年份时需注意数据尚未完全累积。"},{"id":2,"file":"002_platform_source_top8.png","chapter":"第二章 数据采集与构建","title":"开放同行评议平台来源分布","description":"该图展示开放同行评议平台来源分布。不同平台对应后出版评议、开放出版评议、会议开放评审和期刊透明评审等不同制度背景，平台结构需要在后续分析中作为重要控制因素。"},{"id":3,"file":"003_domain_article_type_distribution.png","chapter":"第四章 描述性分析","title":"学科领域与论文类型交叉分布","description":"该图同时比较论文类型与学科领域，显示样本并非均匀分布。不同领域的期刊论文、会议论文和预印本结构存在差异，后续模型需控制领域和文献类型。"},{"id":4,"file":"004_normalized_citation_distribution.png","chapter":"第四章 描述性分析","title":"标准化被引指标分布","description":"该图呈现标准化被引指标分布。它用于观察分布位置、集中程度和组间差异，并说明高被引与高颠覆性代表两种不同的高水平论文表现。"},{"id":5,"file":"005_disruptiveness_distribution.png","chapter":"第四章 描述性分析","title":"标准化颠覆性指标分布","description":"该图呈现标准化颠覆性指标分布。它用于观察分布位置、集中程度和组间差异，并说明高被引与高颠覆性代表两种不同的高水平论文表现。"},{"id":6,"file":"006_top10_rate_by_year.png","chapter":"第四章 描述性分析","title":"高被引论文占比随年份变化","description":"该图从时间维度呈现高被引论文占比随年份变化，用于识别样本增长、影响积累窗口及不同年份之间的结构差异。解释近期年份时需注意数据尚未完全累积。"},{"id":7,"file":"007_response_joint_distribution.png","chapter":"第五章 变量相关性分析","title":"引用影响力与颠覆性的联合分布","description":"该图用于检验引用影响力与颠覆性的联合分布。相关关系反映变量之间的单调关联方向和相对强度，但不应直接解释为因果效应。"},{"id":8,"file":"008_reference_count_by_top10.png","chapter":"第五章 变量相关性分析","title":"高被引与非高被引论文的参考文献数比较","description":"该图考察高被引与非高被引论文的参考文献数比较，重点分析论文知识基础、发表载体和主题可见度与高水平论文之间的关系。组间差异说明这些因素具有解释价值，但单一指标不能独立决定论文表现。"},{"id":9,"file":"009_domain_reference_bucket_top10_rate.png","chapter":"第五章 变量相关性分析","title":"学科领域、参考文献规模与高被引比例","description":"该图考察学科领域、参考文献规模与高被引比例，重点分析论文知识基础、发表载体和主题可见度与高水平论文之间的关系。组间差异说明这些因素具有解释价值，但单一指标不能独立决定论文表现。"},{"id":10,"file":"010_impact_reference_bucket_top10_rate.png","chapter":"第五章 变量相关性分析","title":"期刊影响因子、参考文献规模与高被引比例","description":"该图考察期刊影响因子、参考文献规模与高被引比例，重点分析论文知识基础、发表载体和主题可见度与高水平论文之间的关系。组间差异说明这些因素具有解释价值，但单一指标不能独立决定论文表现。"},{"id":11,"file":"011_domain_keyword_bucket_top10_rate.png","chapter":"第五章 变量相关性分析","title":"学科领域、关键词数量与高被引比例","description":"该图考察学科领域、关键词数量与高被引比例，重点分析论文知识基础、发表载体和主题可见度与高水平论文之间的关系。组间差异说明这些因素具有解释价值，但单一指标不能独立决定论文表现。"},{"id":12,"file":"012_domain_round_top10_rate.png","chapter":"第五章 变量相关性分析","title":"学科领域、评审轮次与高被引比例","description":"该图围绕学科领域、评审轮次与高被引比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":13,"file":"013_domain_round_norm_citation.png","chapter":"第五章 变量相关性分析","title":"学科领域、评审轮次与标准化被引中位数","description":"该图围绕学科领域、评审轮次与标准化被引中位数展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":14,"file":"014_year_impact_review_length.png","chapter":"第五章 变量相关性分析","title":"发表年份、期刊影响因子与审稿文本长度","description":"该图围绕发表年份、期刊影响因子与审稿文本长度展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":15,"file":"015_year_impact_top10_rate.png","chapter":"第五章 变量相关性分析","title":"发表年份、期刊影响因子与高被引比例","description":"该图考察发表年份、期刊影响因子与高被引比例，重点分析论文知识基础、发表载体和主题可见度与高水平论文之间的关系。组间差异说明这些因素具有解释价值，但单一指标不能独立决定论文表现。"},{"id":16,"file":"016_team_round_top10_rate.png","chapter":"第五章 变量相关性分析","title":"团队规模、评审轮次与高被引比例","description":"该图围绕团队规模、评审轮次与高被引比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":17,"file":"017_institution_strength_review_top10_rate.png","chapter":"第五章 变量相关性分析","title":"机构声誉、审稿文本长度与高被引比例","description":"该图围绕机构声誉、审稿文本长度与高被引比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":18,"file":"018_author_strength_review_norm_citation.png","chapter":"第五章 变量相关性分析","title":"作者声誉、审稿文本长度与标准化被引","description":"该图围绕作者声誉、审稿文本长度与标准化被引展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":19,"file":"019_institution_strength_review_norm_citation.png","chapter":"第五章 变量相关性分析","title":"机构声誉、审稿文本长度与标准化被引","description":"该图围绕机构声誉、审稿文本长度与标准化被引展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":20,"file":"020_keyword_frequency.png","chapter":"第三章 特征工程","title":"关键词频次分布","description":"该图展示关键词频次分布，用于概括论文主题、关键词结构和评审关注重点。文本特征可补充传统题录指标，反映研究内容及评审过程中的语义信号。"},{"id":21,"file":"021_topic_frequency.png","chapter":"第三章 特征工程","title":"主题频次分布","description":"该图展示主题频次分布，用于概括论文主题、关键词结构和评审关注重点。文本特征可补充传统题录指标，反映研究内容及评审过程中的语义信号。"},{"id":22,"file":"022_topic_keyword_cooccurrence_share.png","chapter":"第三章 特征工程","title":"主题与关键词共现占比","description":"该图展示主题与关键词共现占比，用于概括论文主题、关键词结构和评审关注重点。文本特征可补充传统题录指标，反映研究内容及评审过程中的语义信号。"},{"id":23,"file":"023_keyword_cooccurrence_matrix.png","chapter":"第三章 特征工程","title":"关键词共现矩阵","description":"该图展示关键词共现矩阵，用于概括论文主题、关键词结构和评审关注重点。文本特征可补充传统题录指标，反映研究内容及评审过程中的语义信号。"},{"id":24,"file":"024_norm_citation_numeric_association_lollipop.png","chapter":"第五章 变量相关性分析","title":"数值特征与标准化被引的相关性","description":"该图用于检验数值特征与标准化被引的相关性。相关关系反映变量之间的单调关联方向和相对强度，但不应直接解释为因果效应。"},{"id":25,"file":"025_disruptiveness_numeric_association_lollipop.png","chapter":"第五章 变量相关性分析","title":"数值特征与标准化颠覆性的相关性","description":"该图用于检验数值特征与标准化颠覆性的相关性。相关关系反映变量之间的单调关联方向和相对强度，但不应直接解释为因果效应。"},{"id":26,"file":"026_ecdf_log_normalized_citation_by_top10.png","chapter":"第五章 变量相关性分析","title":"高被引与非高被引论文的引用分布","description":"该图呈现高被引与非高被引论文的引用分布。它用于观察分布位置、集中程度和组间差异，并说明高被引与高颠覆性代表两种不同的高水平论文表现。"},{"id":27,"file":"027_ecdf_disruptiveness_by_top10.png","chapter":"第五章 变量相关性分析","title":"高被引与非高被引论文的颠覆性分布","description":"该图呈现高被引与非高被引论文的颠覆性分布。它用于观察分布位置、集中程度和组间差异，并说明高被引与高颠覆性代表两种不同的高水平论文表现。"},{"id":28,"file":"028_ecdf_log_reference_count_by_top10.png","chapter":"第五章 变量相关性分析","title":"高被引与非高被引论文的参考文献分布","description":"该图考察高被引与非高被引论文的参考文献分布，重点分析论文知识基础、发表载体和主题可见度与高水平论文之间的关系。组间差异说明这些因素具有解释价值，但单一指标不能独立决定论文表现。"},{"id":29,"file":"029_review_comment_response_length_scatter.png","chapter":"第五章 变量相关性分析","title":"评审意见长度与作者回复长度关系","description":"该图围绕评审意见长度与作者回复长度关系展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":30,"file":"030_impact_factor_reference_count_hexbin.png","chapter":"第五章 变量相关性分析","title":"期刊影响因子与参考文献数量的联合响应","description":"该图考察期刊影响因子与参考文献数量的联合响应，重点分析论文知识基础、发表载体和主题可见度与高水平论文之间的关系。组间差异说明这些因素具有解释价值，但单一指标不能独立决定论文表现。"},{"id":31,"file":"031_team_review_length_interaction_profile.png","chapter":"第五章 变量相关性分析","title":"团队规模与审稿文本长度的交互关系","description":"该图围绕团队规模与审稿文本长度的交互关系展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":32,"file":"032_author_institution_h_index_distribution.png","chapter":"第四章 描述性分析","title":"作者与机构 h 指数分布","description":"该图描述作者与机构 h 指数分布。这些变量刻画作者机构声誉、团队经验或评审互动的基本结构，为后续分组比较和预测建模提供样本背景。"},{"id":33,"file":"033_team_feature_distribution.png","chapter":"第四章 描述性分析","title":"团队规模与团队平均学术年龄分布","description":"该图描述团队规模与团队平均学术年龄分布。这些变量刻画作者机构声誉、团队经验或评审互动的基本结构，为后续分组比较和预测建模提供样本背景。"},{"id":34,"file":"034_reputation_citation_top10_profile.png","chapter":"第五章 变量相关性分析","title":"作者机构声誉分位与高被引论文比例","description":"该图比较作者机构声誉分位与高被引论文比例。结果用于观察学术积累、机构资源和团队结构对引用影响与知识颠覆性的不同作用，并检验二者是否呈现相反的声誉梯度。"},{"id":35,"file":"035_reputation_combination_citation_top10.png","chapter":"第五章 变量相关性分析","title":"联合声誉与高被引论文比例","description":"该图比较联合声誉与高被引论文比例。结果用于观察学术积累、机构资源和团队结构对引用影响与知识颠覆性的不同作用，并检验二者是否呈现相反的声誉梯度。"},{"id":36,"file":"036_team_characteristics_citation_top10.png","chapter":"第五章 变量相关性分析","title":"团队结构特征与高被引论文比例","description":"该图比较团队结构特征与高被引论文比例。结果用于观察学术积累、机构资源和团队结构对引用影响与知识颠覆性的不同作用，并检验二者是否呈现相反的声誉梯度。"},{"id":37,"file":"037_reputation_disruptiveness_top10_profile.png","chapter":"第五章 变量相关性分析","title":"作者机构声誉与高颠覆性论文比例","description":"该图比较作者机构声誉与高颠覆性论文比例。结果用于观察学术积累、机构资源和团队结构对引用影响与知识颠覆性的不同作用，并检验二者是否呈现相反的声誉梯度。"},{"id":38,"file":"038_team_characteristics_disruptiveness_top10.png","chapter":"第五章 变量相关性分析","title":"团队结构特征与高颠覆性论文比例","description":"该图比较团队结构特征与高颠覆性论文比例。结果用于观察学术积累、机构资源和团队结构对引用影响与知识颠覆性的不同作用，并检验二者是否呈现相反的声誉梯度。"},{"id":39,"file":"039_reputation_sentiment_citation_top10.png","chapter":"第五章 变量相关性分析","title":"声誉、首轮评审情感与高被引比例","description":"该图围绕声誉、首轮评审情感与高被引比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":40,"file":"040_reputation_review_length_citation_top10.png","chapter":"第五章 变量相关性分析","title":"声誉、首轮评审长度与高被引比例","description":"该图围绕声誉、首轮评审长度与高被引比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":41,"file":"041_reputation_sentiment_disruptiveness_top10.png","chapter":"第五章 变量相关性分析","title":"声誉、首轮评审情感与高颠覆性比例","description":"该图围绕声誉、首轮评审情感与高颠覆性比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":42,"file":"042_reputation_review_length_disruptiveness_top10.png","chapter":"第五章 变量相关性分析","title":"声誉、首轮评审长度与高颠覆性比例","description":"该图围绕声誉、首轮评审长度与高颠覆性比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":43,"file":"043_platform_share_pie.png","chapter":"第二章 数据采集与构建","title":"同行评议平台占比","description":"该图展示同行评议平台占比。不同平台对应后出版评议、开放出版评议、会议开放评审和期刊透明评审等不同制度背景，平台结构需要在后续分析中作为重要控制因素。"},{"id":44,"file":"044_review_round_distribution.png","chapter":"第四章 描述性分析","title":"同行评议轮次分布","description":"该图描述同行评议轮次分布。这些变量刻画作者机构声誉、团队经验或评审互动的基本结构，为后续分组比较和预测建模提供样本背景。"},{"id":45,"file":"045_review_sentiment_by_round.png","chapter":"第四章 描述性分析","title":"前三轮评审互动情感变化","description":"该图描述前三轮评审互动情感变化。这些变量刻画作者机构声誉、团队经验或评审互动的基本结构，为后续分组比较和预测建模提供样本背景。"},{"id":46,"file":"046_review_comment_length_by_round.png","chapter":"第四章 描述性分析","title":"前三轮评审互动文本长度变化","description":"该图描述前三轮评审互动文本长度变化。这些变量刻画作者机构声誉、团队经验或评审互动的基本结构，为后续分组比较和预测建模提供样本背景。"},{"id":47,"file":"047_review_process_outcome_correlation.png","chapter":"第五章 变量相关性分析","title":"同行评议过程变量与结果变量相关性","description":"该图用于检验同行评议过程变量与结果变量相关性。相关关系反映变量之间的单调关联方向和相对强度，但不应直接解释为因果效应。"},{"id":48,"file":"048_top10_label_balance.png","chapter":"第二章 数据采集与构建","title":"高被引与高颠覆性标签的样本平衡","description":"该图比较高被引与高颠覆性任务中的正负样本数量。类别比例直接影响模型训练、评价指标选择和预测阈值设定，因此需要结合不平衡学习方法解释结果。"},{"id":49,"file":"049_disruptiveness_top10_rate_by_year.png","chapter":"第四章 描述性分析","title":"高颠覆性论文占比随年份变化","description":"该图从时间维度呈现高颠覆性论文占比随年份变化，用于识别样本增长、影响积累窗口及不同年份之间的结构差异。解释近期年份时需注意数据尚未完全累积。"},{"id":50,"file":"050_reference_count_by_disruptiveness_top10.png","chapter":"第五章 变量相关性分析","title":"高颠覆性与非高颠覆性论文的参考文献数比较","description":"该图考察高颠覆性与非高颠覆性论文的参考文献数比较，重点分析论文知识基础、发表载体和主题可见度与高水平论文之间的关系。组间差异说明这些因素具有解释价值，但单一指标不能独立决定论文表现。"},{"id":51,"file":"051_domain_reference_bucket_disruptiveness_top10_rate.png","chapter":"第五章 变量相关性分析","title":"学科领域、参考文献规模与高颠覆性比例","description":"该图考察学科领域、参考文献规模与高颠覆性比例，重点分析论文知识基础、发表载体和主题可见度与高水平论文之间的关系。组间差异说明这些因素具有解释价值，但单一指标不能独立决定论文表现。"},{"id":52,"file":"052_impact_reference_bucket_disruptiveness_top10_rate.png","chapter":"第五章 变量相关性分析","title":"期刊影响因子、参考文献规模与高颠覆性比例","description":"该图考察期刊影响因子、参考文献规模与高颠覆性比例，重点分析论文知识基础、发表载体和主题可见度与高水平论文之间的关系。组间差异说明这些因素具有解释价值，但单一指标不能独立决定论文表现。"},{"id":53,"file":"053_domain_keyword_bucket_disruptiveness_top10_rate.png","chapter":"第五章 变量相关性分析","title":"学科领域、关键词数量与高颠覆性比例","description":"该图考察学科领域、关键词数量与高颠覆性比例，重点分析论文知识基础、发表载体和主题可见度与高水平论文之间的关系。组间差异说明这些因素具有解释价值，但单一指标不能独立决定论文表现。"},{"id":54,"file":"054_domain_round_disruptiveness_top10_rate.png","chapter":"第五章 变量相关性分析","title":"学科领域、评审轮次与高颠覆性比例","description":"该图围绕学科领域、评审轮次与高颠覆性比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":55,"file":"055_year_impact_disruptiveness_top10_rate.png","chapter":"第五章 变量相关性分析","title":"发表年份、期刊影响因子与高颠覆性比例","description":"该图考察发表年份、期刊影响因子与高颠覆性比例，重点分析论文知识基础、发表载体和主题可见度与高水平论文之间的关系。组间差异说明这些因素具有解释价值，但单一指标不能独立决定论文表现。"},{"id":56,"file":"056_team_round_disruptiveness.png","chapter":"第五章 变量相关性分析","title":"团队规模、评审轮次与连续颠覆性指标","description":"该图围绕团队规模、评审轮次与连续颠覆性指标展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":57,"file":"057_team_round_disruptiveness_top10_rate.png","chapter":"第五章 变量相关性分析","title":"团队规模、评审轮次与高颠覆性比例","description":"该图围绕团队规模、评审轮次与高颠覆性比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":58,"file":"058_author_strength_review_top10_rate.png","chapter":"第五章 变量相关性分析","title":"作者声誉、审稿文本长度与高被引比例","description":"该图围绕作者声誉、审稿文本长度与高被引比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":59,"file":"059_author_strength_review_disruptiveness_top10_rate.png","chapter":"第五章 变量相关性分析","title":"作者声誉、审稿文本长度与高颠覆性比例","description":"该图围绕作者声誉、审稿文本长度与高颠覆性比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":60,"file":"060_institution_strength_review_disruptiveness_top10_rate.png","chapter":"第五章 变量相关性分析","title":"机构声誉、审稿文本长度与高颠覆性比例","description":"该图围绕机构声誉、审稿文本长度与高颠覆性比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":61,"file":"061_citation_top10_numeric_association_lollipop.png","chapter":"第五章 变量相关性分析","title":"数值特征与高被引标签的相关性","description":"该图用于检验数值特征与高被引标签的相关性。相关关系反映变量之间的单调关联方向和相对强度，但不应直接解释为因果效应。"},{"id":62,"file":"062_disruptiveness_top10_numeric_association_lollipop.png","chapter":"第五章 变量相关性分析","title":"数值特征与高颠覆性标签的相关性","description":"该图用于检验数值特征与高颠覆性标签的相关性。相关关系反映变量之间的单调关联方向和相对强度，但不应直接解释为因果效应。"},{"id":63,"file":"063_normalized_citation_ecdf_by_disruptiveness_top10.png","chapter":"第五章 变量相关性分析","title":"高颠覆性与非高颠覆性论文的引用分布","description":"该图呈现高颠覆性与非高颠覆性论文的引用分布。它用于观察分布位置、集中程度和组间差异，并说明高被引与高颠覆性代表两种不同的高水平论文表现。"},{"id":64,"file":"064_domain_review_sentiment_top10_rate.png","chapter":"第五章 变量相关性分析","title":"学科领域、评审情感与高被引比例","description":"该图围绕学科领域、评审情感与高被引比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":65,"file":"065_domain_review_intensity_top10_grouped_bar.png","chapter":"第五章 变量相关性分析","title":"学科领域、评审强度与高被引比例","description":"该图围绕学科领域、评审强度与高被引比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":66,"file":"066_domain_review_sentiment_disruptiveness_top10_rate.png","chapter":"第五章 变量相关性分析","title":"学科领域、评审情感与高颠覆性比例","description":"该图围绕学科领域、评审情感与高颠覆性比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":67,"file":"067_domain_review_intensity_disruptiveness_top10_rate.png","chapter":"第五章 变量相关性分析","title":"学科领域、评审强度与高颠覆性比例","description":"该图围绕学科领域、评审强度与高颠覆性比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":68,"file":"068_review_comment_response_by_disruptiveness_top10.png","chapter":"第五章 变量相关性分析","title":"评审意见与作者回复长度的颠覆性分组比较","description":"该图围绕评审意见与作者回复长度的颠覆性分组比较展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":69,"file":"069_team_review_length_disruptiveness_top10_profile.png","chapter":"第五章 变量相关性分析","title":"团队规模、审稿文本长度与高颠覆性比例","description":"该图围绕团队规模、审稿文本长度与高颠覆性比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":70,"file":"070_reputation_continuous_citation.png","chapter":"第五章 变量相关性分析","title":"作者机构声誉与连续引用指标","description":"该图比较作者机构声誉与连续引用指标。结果用于观察学术积累、机构资源和团队结构对引用影响与知识颠覆性的不同作用，并检验二者是否呈现相反的声誉梯度。"},{"id":71,"file":"071_reputation_combination_disruptiveness_top10.png","chapter":"第五章 变量相关性分析","title":"联合声誉与高颠覆性论文比例","description":"该图比较联合声誉与高颠覆性论文比例。结果用于观察学术积累、机构资源和团队结构对引用影响与知识颠覆性的不同作用，并检验二者是否呈现相反的声誉梯度。"},{"id":72,"file":"072_reputation_combination_disruptiveness.png","chapter":"第五章 变量相关性分析","title":"联合声誉与连续颠覆性指标","description":"该图比较联合声誉与连续颠覆性指标。结果用于观察学术积累、机构资源和团队结构对引用影响与知识颠覆性的不同作用，并检验二者是否呈现相反的声誉梯度。"},{"id":73,"file":"073_reputation_continuous_disruptiveness.png","chapter":"第五章 变量相关性分析","title":"作者机构声誉与连续颠覆性指标","description":"该图比较作者机构声誉与连续颠覆性指标。结果用于观察学术积累、机构资源和团队结构对引用影响与知识颠覆性的不同作用，并检验二者是否呈现相反的声誉梯度。"},{"id":74,"file":"074_platform_share_bar.png","chapter":"第二章 数据采集与构建","title":"开放同行评议平台论文数量占比","description":"该图展示开放同行评议平台论文数量占比。不同平台对应后出版评议、开放出版评议、会议开放评审和期刊透明评审等不同制度背景，平台结构需要在后续分析中作为重要控制因素。"},{"id":75,"file":"075_topic_terms_top10.png","chapter":"第三章 特征工程","title":"主要主题及其代表词","description":"该图展示主要主题及其代表词，用于概括论文主题、关键词结构和评审关注重点。文本特征可补充传统题录指标，反映研究内容及评审过程中的语义信号。"},{"id":76,"file":"076_raw_sentiment_citation_top10.png","chapter":"第五章 变量相关性分析","title":"原始评审情感与高被引比例","description":"该图围绕原始评审情感与高被引比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":77,"file":"077_raw_length_citation_top10.png","chapter":"第五章 变量相关性分析","title":"原始评审文本长度与高被引比例","description":"该图围绕原始评审文本长度与高被引比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":78,"file":"078_raw_sentiment_disruptiveness_top10.png","chapter":"第五章 变量相关性分析","title":"原始评审情感与高颠覆性比例","description":"该图围绕原始评审情感与高颠覆性比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":79,"file":"079_raw_length_disruptiveness_top10.png","chapter":"第五章 变量相关性分析","title":"原始评审文本长度与高颠覆性比例","description":"该图围绕原始评审文本长度与高颠覆性比例展开分组或交互分析。评审轮次、情感、文本长度和回应强度提供过程性信息，但其含义会受到领域、平台、团队和论文复杂度的共同影响。"},{"id":80,"file":"080_reputation_decile_high_disruptiveness.png","chapter":"第五章 变量相关性分析","title":"声誉十分位与高颠覆性论文比例","description":"该图比较声誉十分位与高颠覆性论文比例。结果用于观察学术积累、机构资源和团队结构对引用影响与知识颠覆性的不同作用，并检验二者是否呈现相反的声誉梯度。"},{"id":81,"file":"081_tfidf_distinctive_vocabulary.png","chapter":"第三章 特征工程","title":"不同组别的 TF-IDF 区分词汇","description":"该图展示不同组别的 TF-IDF 区分词汇，用于概括论文主题、关键词结构和评审关注重点。文本特征可补充传统题录指标，反映研究内容及评审过程中的语义信号。"},{"id":82,"file":"082_reviewer_sentiment_top10.png","chapter":"第四章 描述性分析","title":"评审人情感与高被引论文比例","description":"该图描述评审人情感与高被引论文比例。这些变量刻画作者机构声誉、团队经验或评审互动的基本结构，为后续分组比较和预测建模提供样本背景。"},{"id":83,"file":"083_review_focus_radar.png","chapter":"第三章 特征工程","title":"首轮评审关注焦点分布","description":"该图展示首轮评审关注焦点分布，用于概括论文主题、关键词结构和评审关注重点。文本特征可补充传统题录指标，反映研究内容及评审过程中的语义信号。"}];

const DATASETS={
overall:{label:'总集',intro:'本研究系统采集并整合开放同行评议文本及其对应论文数据，将论文特征、作者机构特征和同行评议过程特征结合起来，分析不同类型特征与高水平论文之间的关系，并构建高被引与高颠覆性论文预测模型。总集页面用于呈现跨平台、跨领域的整体结构，并作为三个代表性领域子集的比较基准。'},
ai:{label:'人工智能',intro:'人工智能子集包含约 18,280 篇论文，数据主要来自 OpenReview 等会议开放评审平台。该领域以会议论文、预印本和快速迭代的技术研究为重要特征，高影响力论文通常与新方法、新模型、新框架、算法性能提升和应用扩展密切相关。相较于跨学科总集，人工智能领域内部的预测规律更稳定，模型能够较好地识别高被引论文。'},
biomedicine:{label:'生物医学',intro:'生物医学子集包含约 33,967 篇论文，是三个领域子集中规模最大的部分。数据较多来自 PubPeer、F1000Research 和 Nature Communications，覆盖发表后评论、开放出版评议和期刊透明评审等多种模式。该领域内部同时包含生命科学、医学健康、临床研究和基础机制研究，不同研究类型的引用增长、团队结构和评审过程存在较强差异。'},
physics:{label:'物理学',intro:'物理学子集包含约 11,817 篇论文，用于考察物理科学领域中知识基础、合作团队、作者机构声誉和同行评议过程与论文影响力之间的关系。当前页面采用已筛选的物理学子集，而不是直接等同于 OpenAlex 的完整 Physical Sciences 大类；该筛选口径有助于减少计算机科学记录对物理学解释的干扰。'}
};

const DATASET_PROFILES={
overall:{
stats:[['101,795','记录数'],['100,537','唯一论文数'],['84','变量字段数'],['83','图表数量']],
cards:[
['数据来源','PubPeer、F1000Research、OpenReview、Nature Communications、Quantitative Science Studies 与 OpenAlex 共同构成开放同行评议、题录、作者、机构和引用元数据基础。'],
['质量概况','总集包含 101,795 条记录、100,537 篇唯一论文和 84 个字段；DOI 覆盖率约 81.82%，领域、学科和主题字段缺失约 0.26%。'],
['时间结构','样本年份覆盖 1895—2025 年，2015 年以后论文占 88.39%，2020—2025 年占 66.95%，2023 年达到 16,453 篇峰值。']
]},
ai:{
stats:[['18,280','记录数'],['18,280','唯一论文数'],['85','变量字段数'],['83','图表数量']],
cards:[
['数据来源','人工智能子集主要来自 OpenReview 等会议开放评审平台，头部来源包括 NeurIPS、ICLR、TMLR 与 EMNLP 相关记录。'],
['质量概况','子集包含 18,280 条记录、18,280 篇唯一论文和 85 个字段；领域、学科和主题字段缺失约 0.61%，摘要缺失约 5.99%。'],
['时间结构','样本年份覆盖 1988—2025 年，2015 年以后论文占 99.98%，2020—2025 年占 90.83%，2023 年达到 7,416 篇峰值。']
]},
biomedicine:{
stats:[['33,967','记录数'],['33,967','唯一论文数'],['85','变量字段数'],['83','图表数量']],
cards:[
['数据来源','生物医学子集较多来自 PubPeer、F1000Research 和 Nature Communications，覆盖发表后评论、开放出版评议和期刊透明评审等模式。'],
['质量概况','子集包含 33,967 条记录、33,967 篇唯一论文和 85 个字段；DOI 非空记录为 33,424 条，关键词和摘要缺失分别约 21.31% 与 16.17%。'],
['时间结构','样本年份覆盖 1897—2025 年，2015 年以后论文占 81.77%，2020—2025 年占 50.99%，2022 年达到 3,610 篇峰值。']
]},
physics:{
stats:[['11,817','记录数'],['11,817','唯一论文数'],['85','变量字段数'],['83','图表数量']],
cards:[
['数据来源','物理学子集以物理科学筛选记录为基础，主要来源包括 Nature Communications、arXiv、Scientific Reports、RSC Advances 和 F1000Research。'],
['质量概况','子集包含 11,817 条记录、11,817 篇唯一论文和 85 个字段；DOI 非空记录为 10,720 条，关键词和摘要缺失分别约 16.76% 与 34.53%。'],
['时间结构','样本年份覆盖 1978—2025 年，2015 年以后论文占 93.12%，2020—2025 年占 70.80%，2022 年达到 1,713 篇峰值。']
]}
};

const CHAPTER_DETAILS={
'chapter-1':{
questions:['论文、作者机构和评议过程特征与高水平论文有什么关系？','不同领域的评议特征是否存在差异？','同行评议信息能否在传统指标之外提升预测效果？'],
cards:[['为什么使用开放同行评议文本','开放评议文本产生于论文评价过程中，直接记录专家对创新性、方法、数据、表达和有效性的判断，可补充题录和引用指标难以覆盖的过程信息。'],['两个结果变量','标准化被引 Top10 更接近累计认可与可见度，颠覆性 Top10 更接近知识结构改变；二者共同构成高水平论文的互补视角。'],['为何分领域','生物医学、人工智能和物理学的数据平台、发表模式、引用窗口和评审制度不同，分领域建模可降低跨学科平均化造成的信息损失。']]
},
'chapter-2':{
cards:[['数据来源','PubPeer 代表发表后同行评议，F1000Research 代表开放出版与公开评审，OpenReview 代表会议开放评审，Nature Communications 与 Quantitative Science Studies 代表期刊透明评审，OpenAlex 负责补充论文、作者、机构和引用元数据。'],['数据处理','处理流程包括 DOI 和标题联合匹配、不同平台字段统一、PDF 评审文件 OCR 和文本切分、评审意见与作者回复及评审轮次对应、去重、缺失值标记和标准化。'],['数据质量','总集最终形成 101,795 条记录、100,537 篇唯一论文和 84 个变量字段；子集页面统一展示记录数、唯一论文数、变量字段数和图表数量。']]
},
'chapter-3':{
cards:[['论文与知识网络','包括发表年份、论文类型、参考文献数量、学科多样性、创新性得分、期刊或会议影响力，以及标题、摘要、关键词和主题共现网络。'],['作者、机构与团队','包括第一作者和末位作者 h 指数、五年产出与五年被引、职业年龄调整后的产出与影响力、作者声誉差距、机构影响力、团队规模与团队平均学术年龄。'],['同行评议过程','包括评审轮次、是否进入第二轮或第三轮、评审意见情感、作者回复情感、评审和回复文本长度、回复长度与评审长度比、评审强度、修改努力，以及创新性、方法、数据、写作、文献和有效性六类评审焦点。']]
},
'chapter-4':{
cards:[['总集结构','总集覆盖 1895—2025 年，2015 年以后论文占 88.39%，2020—2025 年占 66.95%，2023 年样本达到 16,453 篇峰值。'],['结果变量分布','标准化被引指标中位数约为 0.808；高被引与高颠覆性分布不同，不能把二者视为同一结果的重复表达。'],['评审过程','总集中第一轮评审记录占 81.75%，两轮和三轮分别占 13.92% 和 3.61%；评审意见情感从第一轮约 0.405 上升到第二轮约 0.570，作者回复情感从第一轮约 0.831 降到第三轮约 0.563。']]
},
'chapter-5':{
cards:[['两类结果变量','normalized_citation 与 disruptiveness_norm 的 Spearman 相关约为 -0.04，二者几乎没有明显单调关系；高被引更接近累计认可，颠覆性更接近知识结构变化。'],['论文特征','高被引组参考文献数中位数约为 49，非高被引组约为 31；高期刊影响因子和高参考文献数组合的高被引比例在报告中达到约 65.6%。'],['作者机构与团队','作者和机构声誉分位越高，高被引比例通常越高；第一作者与末位作者均处于最高声誉分位时高被引比例约 66.8%，均为最低分位时约 15.3%。']]
},
'chapter-6':{
cards:[['建模任务','模型以标准化被引 Top10 和颠覆性 Top10 为二分类目标，输入变量覆盖论文元数据、作者与机构声誉、团队结构和同行评议文本过程特征。'],['评价方法','使用 8:2 训练测试划分，并比较 XGBoost、LightGBM 和随机森林；指标包括 Accuracy、ROC-AUC、Precision、Recall 和 F1-score。'],['领域差异','人工智能页面的高被引预测表现最好；生物医学样本规模最大但内部异质性更强；物理学 ROC-AUC 接近其他子集，但整体分类准确率略低。']]
},
'chapter-7':{
cards:[['共同发现','高被引和高颠覆性是互补指标；论文知识基础、发表平台和作者机构声誉对高被引更稳定；同行评议特征提供过程性补充信息。'],['解释边界','评审轮次和文本长度不应被简单解释为质量高低，它们还可能反映论文复杂性、争议性、平台规则和作者回复策略。'],['领域差异','人工智能领域的预测规律更稳定，物理学和生物医学内部异质性更强；相同指标在不同领域可能具有不同方向或强度。']]
},
'chapter-8':{
cards:[['数据集范围','页面展示总集及人工智能、生物医学、物理学三个代表性领域子集，所有页面使用统一图表编号和解释框架。'],['变量字段','数据包含论文、作者、机构、团队、同行评议文本、目标变量和模型特征字段，可用于描述性分析、相关性分析和预测建模。'],['开放边界','图表和代码可支持复核与再分析，但预测结果应作为科研评价辅助信号，不能替代专家判断或单独用于论文质量裁决。']]
}
};

const MODEL_RESULTS={
overall:[
['XGBoost','0.758','0.829','0.460','226'],
['LightGBM','0.759','0.832','0.455','226'],
['随机森林','0.731','0.797','0.455','226']
],
ai:[
['XGBoost','0.806','0.841','0.475','177'],
['LightGBM','0.804','0.836','0.450','177'],
['随机森林','0.800','0.820','0.455','177']
],
biomedicine:[
['XGBoost','0.743','0.813','0.460','214'],
['LightGBM','0.739','0.810','0.475','214'],
['随机森林','0.719','0.782','0.445','214']
],
physics:[
['XGBoost','0.732','0.802','0.500','201'],
['LightGBM','0.724','0.795','0.535','201'],
['随机森林','0.708','0.777','0.470','201']
]
};
const CHAPTERS=[
['chapter-1','第一章 引言','同行评议是现代科学共同体评估学术质量的重要方式。开放同行评议文本直接记录专家对研究内容、方法、创新性和学术价值的判断，为高水平论文的早期识别提供了区别于被引量和作者背景的过程性信息。本研究围绕论文、作者机构和同行评议三个层面建立分析框架。'],
['chapter-2','第二章 数据采集与构建','研究数据来自 PubPeer、F1000Research、OpenReview、Nature Communications 和 Quantitative Science Studies，并利用 OpenAlex 补充论文、作者、机构、引用关系和学科领域等元数据。数据经过结构化处理、字段标准化、去重和匹配后，进一步构建标准化被引 Top10 与标准化颠覆性 Top10 两类目标变量。'],
['chapter-3','第三章 特征工程','特征工程围绕论文本身、作者及其机构、同行评议过程三个维度展开。论文层面包括知识基础、创新性、发表渠道和浅层文本特征；作者机构层面刻画学术声誉、职业阶段和团队结构；同行评议层面提取轮次、情感、文本长度、回应强度和评审关注焦点。'],
['chapter-4','第四章 描述性分析','本章首先考察样本年份、平台来源、论文类型和学科结构，再比较标准化被引与颠覆性指标的分布及时间差异。同时描述评审轮次、评审情感、文本长度、作者机构声誉和团队结构，为后续关联分析提供必要的样本背景。'],
['chapter-5','第五章 变量相关性分析','本章分别围绕高被引和高颠覆性两类结果展开。分析论文知识网络、期刊影响、关键词、作者机构声誉、团队结构以及同行评议轮次、情感和文本长度等变量的分组差异与相关方向，并强调高被引与高颠覆性并非同一结果的重复度量。'],
['chapter-6','第六章 模型构建与结果','预测建模分别以标准化被引 Top10 和标准化颠覆性 Top10 为目标。模型比较论文特征、作者机构特征和同行评议特征的增量解释能力，并通过特征重要性和分组表现分析不同领域中预测信号的稳定性与差异。'],
['chapter-7','第七章 总结与讨论','研究结果表明，引用影响更接近累计认可、可见度和资源网络的共同作用，而颠覆性更接近知识结构改变和非典型研究路径。同行评议变量能够提供过程视角，但需要结合年份、学科、平台和文献类型进行解释。'],
['chapter-8','第八章 项目成果与开放资源','项目形成开放同行评议关联数据、特征工程流程、描述性分析图表和预测模型结果。网页按照总集及三个代表性领域分别展示全部图表，使不同数据集之间的结果能够在统一报告脉络下进行比较。']
];
const chapterMap={'第二章 数据采集与构建':'chapter-2','第三章 特征工程':'chapter-3','第四章 描述性分析':'chapter-4','第五章 变量相关性分析':'chapter-5'};
const datasetKey=document.body.dataset.dataset;
const meta=DATASETS[datasetKey];
document.title=`${meta.label}数据集｜开放同行评议与高水平论文`;
const nav=[['index.html','overall','总集'],['ai.html','ai','人工智能'],['biomedicine.html','biomedicine','生物医学'],['physics.html','physics','物理学']].map(item=>`<a class="${item[1]===datasetKey?'active':''}" href="${item[0]}">${item[2]}</a>`).join('');
const toc=CHAPTERS.map(chapter=>`<a href="#${chapter[0]}">${chapter[1]}</a>`).join('');
function renderProfile(){
  const profile=DATASET_PROFILES[datasetKey];
  if(!profile) return '';
  const stats=profile.stats.map(item=>`<div class="stat"><strong>${item[0]}</strong><span>${item[1]}</span></div>`).join('');
  const cards=profile.cards.map(item=>`<article class="info-card"><h3>${item[0]}</h3><p>${item[1]}</p></article>`).join('');
  return `<div class="stat-row">${stats}</div><div class="info-grid">${cards}</div>`;
}
function renderChapterDetail(chapterId){
  const detail=CHAPTER_DETAILS[chapterId];
  if(!detail) return '';
  const questions=detail.questions?`<div class="question-card"><h3>研究问题</h3><ol>${detail.questions.map(item=>`<li>${item}</li>`).join('')}</ol></div>`:'';
  const cards=detail.cards?`<div class="info-grid chapter-info">${detail.cards.map(item=>`<article class="info-card"><h3>${item[0]}</h3><p>${item[1]}</p></article>`).join('')}</div>`:'';
  return `<div class="chapter-detail">${questions}${cards}</div>`;
}
function renderModelBlock(){
  const rows=MODEL_RESULTS[datasetKey].map(row=>`<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td></tr>`).join('');
  const aiNote=datasetKey==='ai'?`<article class="info-card model-note"><h3>人工智能特征重要性解读</h3><p>人工智能高被引预测更依赖发表年份、来源名称频次、会议类型与来源影响力交互、来源影响因子、来源领域排名、论文类型和作者职业阶段影响力等结构性信号。这说明会议开放评审场景中，平台、时间窗口、作者职业阶段和技术主题可见度共同塑造预测效果。</p></article>`:'';
  return `<div class="model-block"><h3>${meta.label}引用 Top10 预测模型</h3><table><thead><tr><th>模型</th><th>Accuracy</th><th>ROC-AUC</th><th>阈值</th><th>特征数</th></tr></thead><tbody>${rows}</tbody></table>${aiNote}</div>`;
}
function datasetDescription(base){
  if(datasetKey==='overall') return base;
  return `在${meta.label}子数据集中，${base.replace(/^该图/,'本图').replace(/^该图用于/,'本图用于')}`;
}
const sections=CHAPTERS.map(chapter=>{
  const figures=FIGURES.filter(figure=>chapterMap[figure.chapter]===chapter[0]);
  const gallery=figures.length?`<div class="fig-grid">${figures.map(figure=>`<figure class="figure"><div class="imgbox"><img loading="lazy" src="assets/datasets/${datasetKey}/${figure.file}" alt="图 ${String(figure.id).padStart(2,'0')} ${figure.title}"></div><figcaption><b>图 ${String(figure.id).padStart(2,'0')}　${figure.title}</b><p>${datasetDescription(figure.description)}</p></figcaption></figure>`).join('')}</div>`:'';
  const modelBlock=chapter[0]==='chapter-6'?renderModelBlock():'';
  return `<section id="${chapter[0]}" class="chapter"><div class="chapter-head"><h2>${chapter[1]}</h2><p>${chapter[2]}</p></div>${renderChapterDetail(chapter[0])}${modelBlock}${gallery}</section>`;
}).join('');
document.body.innerHTML=`<header class="header"><div class="shell nav"><a class="brand" href="index.html">开放同行评议与高水平论文</a><nav class="dataset-nav">${nav}</nav></div></header><main><section class="hero"><div class="shell"><div class="eyebrow">${meta.label}数据集</div><h1>${meta.label}数据集</h1><p>${meta.intro}</p>${renderProfile()}</div></section><div class="shell layout"><aside class="toc">${toc}</aside><div>${sections}</div></div></main><footer class="footer"><div class="shell">基于《中信所-报告v1》的章节脉络组织，每个数据集页面展示 83 张图及对应说明。</div></footer>`;
const tocLinks=[...document.querySelectorAll('.toc a')];
const chapterSections=[...document.querySelectorAll('.chapter')];
function setCurrentToc(id){
  tocLinks.forEach(link=>link.classList.toggle('current', link.getAttribute('href')===`#${id}`));
}
function updateCurrentToc(){
  const bottomReached=window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-2;
  let current=bottomReached?chapterSections[chapterSections.length-1]:chapterSections[0];
  if(!bottomReached){
    for(const section of chapterSections){
      if(section.getBoundingClientRect().top<=window.innerHeight*0.35) current=section;
    }
  }
  if(current) setCurrentToc(current.id);
}
window.addEventListener('scroll',updateCurrentToc,{passive:true});
window.addEventListener('resize',updateCurrentToc);
updateCurrentToc();
