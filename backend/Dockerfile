FROM kehuo/centos8_conda:v1 as builder
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
ENV PYTHONIOENCODING utf-8
ENV LANG en_US.UTF-8

WORKDIR /data/project
ADD ./resource/nginx.conf ./nginx.conf
ADD ./resource/default.conf ./default.conf
ADD ./resource/pip.conf /root/.pip/
ADD ./requirements.txt ./requirements.txt
ADD ./service.conf ./service.conf
# 2颗归一的tree， 以及所需的映射文件:
ADD ./exam_standard/normalization_processor/data ./norm_data
# 2个processor的配置文件:
ADD ./exam_standard/exam_standard_processor/processor_config.json ./esp_config.json
ADD ./exam_standard/normalization_processor/processor_config.json ./np_config.json
RUN source ~/.bashrc \
    && conda activate myenv\
    && pip install --upgrade pip && pip install Cython && pip install path.py \
	&& pip install -r ./requirements.txt
ADD ./ ./
RUN source ~/.bashrc \
    && conda activate myenv\
    && pip install pyinstaller \
    && pyinstaller --onefile server.spec --hidden-import=gunicorn.workers.ggevent;

FROM kehuo/centos8_conda:v1
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
ENV LANG en_US.UTF-8
RUN yum install -y epel-release && yum install -y nginx
WORKDIR /project

RUN mkdir /project/norm_data
RUN mkdir /project/config && mkdir -p /data/logs
# radlex_tree 等归一所需的数据
COPY --from=builder /data/project/norm_data ./norm_data
# 2个processor的配置文件, 用来修改运行的plan等参数
COPY --from=builder /data/project/esp_config.json ./config/exam_standard_processor_config.json
COPY --from=builder /data/project/np_config.json ./config/normalization_processor_config.json
# 以下是其他所需的数据
COPY --from=builder /data/project/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /data/project/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /data/project/dist/server ./
COPY --from=builder /data/project/start.sh ./
COPY --from=builder /data/project/service.conf ./config/service.conf
RUN chmod u+x start.sh

CMD ["/project/start.sh"]