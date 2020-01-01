def build_norm_result(np, standard_data):
    # np = Normalizer 类的一个实例化对象, 在init_model时启动
    res = np.run(standard_data)
    return res
