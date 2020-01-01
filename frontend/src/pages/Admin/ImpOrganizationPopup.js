import { Upload, message, Button, Icon } from "antd";
import * as urls from '../../utils/urls';
import reqwest from 'reqwest';

// export default class ImpOrganizationPopup extends React.Component {
//   constructor(props) {
//     let impOrganizationUrl = urls.getImpOrganizationUrl();
//     super(props);
//     this.state = {
//       name: "file",
//       action: impOrganizationUrl,
//       headers: {
//         // authorization: 'authorization-text',
//       },
//       onChange(info) {
//         if (info.file.status !== "uploading") {
//           console.log(info.file, info.fileList);
//         }
//         if (info.file.status === "done") {
//           message.success(`${info.file.name} file uploaded successfully`);
//         } else if (info.file.status === "error") {
//           message.error(`${info.file.name} file upload failed.`);
//         }
//       }
//     };
//   }
//
//
//   render() {
//     return (
//       <Upload {...this.state}>
//         <Button>
//           <Icon type="upload"/> 导入机构信息
//         </Button>
//       </Upload>
//     );
//   }
// }

///////


export default class ImpOrganizationPopup extends React.Component {
  state = {
    fileList: [],
    uploading: false,
  }

  handleUpload = () => {
    const { fileList } = this.state;
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('file', file);
    });

    this.setState({
      uploading: true,
    });

    // You can use any AJAX library you like
    reqwest({
      url: urls.getImpOrganizationUrl(),
      method: 'post',
      processData: false,
      data: formData,
      success: (resp) => {
        this.setState({
          fileList: [],
          uploading: false,
        });
        if (resp.code ==='FAILURE'){
          message.error('upload failed.' + resp.message);
        }
        message.success('upload successfully.');
      },
      error: () => {
        this.setState({
          uploading: false,
        });
        message.error('upload failed.');
      },
    });
  }

  render() {
    const { uploading, fileList } = this.state;
    const props = {
      onRemove: (file) => {
        this.setState((state) => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: (file) => {
        this.setState(state => ({
          fileList: [...state.fileList, file],
        }));
        return false;
      },
      fileList,
    };

    return (
      <div>
        <Upload {...props}>
          <Button>
            <Icon type="upload" /> 请选择要导入的机构信息文件
          </Button>
        </Upload>
        <Button
          type="primary"
          onClick={this.handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
          style={{ marginTop: 8 }}
        >
          {uploading ? 'Uploading' : '开始导入' }
        </Button>
      </div>
    );
  }
}
