import React, { Component } from "react";
// import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  state = {
    imgPreviewLoaded: false,
    imgInputLoaded: false,
    imgLabelLoaded: false,
    imgOutputLoaded: false,

    imgPreviewUrl: "",
    previewFile: null,

    imgInputUrl: null,
    imgLabelUrl: null,
    imgOutputUrl: null,

    isLoading: false,

    distance_generated: "",
    distance_input: ""
  };

  _imageChange = e => {
    e.preventDefault();

    let reader = new FileReader();
    if (e.target.files) {
      let file = e.target.files[0];

      reader.onloadend = () => {
        this.setState({
          previewFile: file,
          imgPreviewUrl: reader.result,
          imgPreviewLoaded: true
        });
      };

      reader.readAsDataURL(file);
    }
  };

  handleChange = e => {
    this.setState({ imgPreviewUrl: e.target.value });
  };

  keyPress = e => {
    if (e.keyCode === 13) {
      fetch(this.state.imgPreviewUrl)
        .then(res => res.blob()) // Gets the response and returns it as a blob
        .then(blob => {
          let objectURL = URL.createObjectURL(blob);
          let myImage = new Image();
          myImage.src = objectURL;

          console.log(blob);

          if (blob.type === "text/html") {
            alert("Failed to fetch image.");
          } else {
            this.setState({
              imgPreviewLoaded: true,
              imgPreviewUrl: objectURL,
              previewFile: blob
            });
          }
        });
    }
  };

  _resetClicked = e => {
    this.setState({
      imgPreviewLoaded: false,
      imgInputLoaded: false,
      imgLabelLoaded: false,
      imgOutputLoaded: false,

      imgPreviewUrl: "",
      previewFile: null,

      imgInputUrl: null,
      imgLabelUrl: null,
      imgOutputUrl: null,

      isLoading: false
    });
  };

  _generateClicked = e => {
    e.preventDefault();
    if (!this.state.imgPreviewLoaded) {
      alert("Select image first!");
    } else {
      const formData = new FormData();
      formData.append("img_input", this.state.previewFile);

      this.setState({
        isLoading: true,
        imgInputLoaded: false,
        imgLabelLoaded: false,
        imgOutputLoaded: false
      });

      fetch("http://127.0.0.1:1234/degrade-reconstruct", {
        method: "POST",
        body: formData
      })
        .then(res => res.json())
        .then(
          result => {
            this.setState({
              isLoading: false,
              imgInputLoaded: true,
              imgLabelLoaded: true,
              imgOutputLoaded: true,
              imgInputUrl:
                "http://127.0.0.1:1234/get_image?filename=" +
                result.input_filename,
              imgOutputUrl:
                "http://127.0.0.1:1234/get_image?filename=" +
                result.output_filename,
              imgLabelUrl:
                "http://127.0.0.1:1234/get_image?filename=" +
                result.label_filename
            });

            var url = new URL("http://127.0.0.1:4321/encoding");
            var params = {
              input_filename: result.input_filename,
              output_filename: result.output_filename,
              label_filename: result.label_filename
            };
            url.search = new URLSearchParams(params);

            fetch(url)
              .then(res => res.json())
              .then(
                result => {
                  this.setState({
                    distance_generated: result.distance_generated,
                    distance_input: result.distance_input
                  });
                },
                error => {
                  alert(error);
                  console.log(error);
                  this.setState({
                    isLoading: false
                  });
                }
              );
          },
          error => {
            alert(error);
            console.log(error);
            this.setState({
              isLoading: false
            });
          }
        );
    }
  };

  render() {
    return (
      <div id="home">
        <div className="header">
          <h2 className="title">
            SINGLE IMAGE SUPER RESOLUTION FOR FACE IMAGES USING GENERATIVE
            ADVERSARIAL NETWORK
          </h2>
          <h3 className="name">Septian Dwi Indradi - 1301154164</h3>
        </div>
        <div className="main">
          <div className="preview">
            <p>Input Image</p>
            <div className="preview-container">
              {this.state.imgPreviewLoaded ? (
                <div className="preview-loaded">
                  <input
                    type="file"
                    name="preview"
                    id="img-preview"
                    onChange={e => this._imageChange(e)}
                  />
                  <img src={this.state.imgPreviewUrl} alt="preview" />
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    name="preview"
                    id="img-preview"
                    onChange={e => this._imageChange(e)}
                  />
                  <p>or</p>
                  <input
                    value={this.state.imgPreviewUrl}
                    onKeyDown={this.keyPress}
                    onChange={this.handleChange}
                    placeholder="Paste image URL"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="btn-generate-container">
            <div className="btn-group">
              <button
                className="btn-generate"
                onClick={e => this._generateClicked(e)}
              >
                GENERATE
              </button>
              <button
                className="btn-generate"
                onClick={e => this._resetClicked(e)}
              >
                RESET
              </button>
            </div>
          </div>
          <div className="label">
            <p>Cropped Image</p>
            <div className="label-container">
              {this.state.imgLabelLoaded ? (
                <div className="result-container">
                  <img src={this.state.imgLabelUrl} alt="label" />
                  <p style={{color:"white"}}>Placeholder</p>
                </div>
              ) : this.state.isLoading ? (
                <img src="https://i.redd.it/ounq1mw5kdxy.gif" alt="label" />
              ) : (
                <img
                  src="http://www.divestco.com/wp-content/uploads/2017/08/person-placeholder-portrait.png"
                  alt="label"
                />
              )}
            </div>
          </div>
          <div className="input">
            <p>Degraded Image</p>
            <div className="input-container">
              {this.state.imgInputLoaded ? (
                <div className="result-container">                
                  <img src={this.state.imgInputUrl} alt="input" />
                  <p>Distance : {this.state.distance_input}</p>
                </div>
              ) : this.state.isLoading ? (
                <img src="https://i.redd.it/ounq1mw5kdxy.gif" alt="label" />
              ) : (
                <img
                  src="http://www.divestco.com/wp-content/uploads/2017/08/person-placeholder-portrait.png"
                  alt="input"
                />
              )}
            </div>
          </div>
          <div className="output">
            <p>Output Image</p>
            <div className="output-container">
              {this.state.imgOutputLoaded ? (
                <div className="result-container">                
                  <img src={this.state.imgOutputUrl} alt="output" />
                  <p>Distance : {this.state.distance_generated}</p>
                </div>
              ) : this.state.isLoading ? (
                <img src="https://i.redd.it/ounq1mw5kdxy.gif" alt="label" />
              ) : (
                <img
                  src="http://www.divestco.com/wp-content/uploads/2017/08/person-placeholder-portrait.png"
                  alt="degraded"
                />
              )}
            </div>
          </div>
        </div>
        <div className="footer">Copyright &copy; septiandrd 2019</div>
      </div>
    );
  }
}

export default App;
