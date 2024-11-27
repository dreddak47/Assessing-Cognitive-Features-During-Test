import React, { useState ,useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("");
  const [institution, setInstitution] = useState("");
  const [batch, setBatch] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [refID, setRefID] = useState("");
  const [mobile, setMobile] = useState("");

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);


  // webgazer.setGazeListener(function(data, elapsedTime) {
  //   if (data == null) {
  //     return;
  //   }
  //   var xprediction = data.x; //these x coordinates are relative to the viewport
  //   var yprediction = data.y; //these y coordinates are relative to the viewport
  //   console.log(elapsedTime); //elapsed time is based on time since begin was called
  // }).begin();
  
  // useEffect(() => {
  //   const webgazer=window.webgazer;
  //   webgazer.setGazeListener((data, elapsedTime)=>{
  //     // console.log(data,elapsedTime);
  //     axios
  //     .post("http://localhost:5000/receive-gazer", { data,elapsedTime })
  //     .catch((error) => console.error("Error sending frame to Node.js: ", error));
  //   }).begin();
  // }, []);



  


  const handleSubmit = (e) => {
    console.log("registering");

    e.preventDefault();
    setError("");
    let data={}
    if(institution === "IIITD"){
      data={name,email,institution,mobile,batch,branch,rollNo};
    }else if(institution === "Other"){
      data={name,email,institution,mobile,refID};
    }
    setLoading(true);
    axios.post(`${process.env.REACT_APP_BACKEND_BASEURL}/register`, data)
      .then(response => {
        setLoading(false);
        console.log(response.data.id);
        navigate('/instruction',{ state: { info: name, id : response.data.id} });
      })
      .catch(error => {
        setLoading(false);
        console.error('There was an error!', error)
        if (error.response && error.response.data) {
          setError(error.response.data.error); // Backend-provided error
        } else {
          setError("An unexpected error occurred. Try Again in a while"); // Generic error
        }
      });
  };




  useEffect(() => {
    const registerLink = document.getElementById("register");
    console.log(name)
    if (registerLink) {
      registerLink.addEventListener("click", (e) => {
        handleSubmit(e);    // Calls the form submission logic directly
      });
    }
    return () => {
      if (registerLink) {
        registerLink.removeEventListener("click", handleSubmit);
      }
    };
  }, []);




    return (
      <div>
        {/* Basic */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* Mobile Metas */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        {/* Site Metas */}
        <meta name="keywords" content />
        <meta name="description" content />
        <meta name="author" content />
        <title>Anumaan</title>
        {/* bootstrap core css */}
        <link rel="stylesheet" type="text/css" href="css/bootstrap.css" />
        <link href="https://fonts.googleapis.com/css?family=Poppins:400,700&display=swap" rel="stylesheet" />
        {/* Custom styles for this template */}
        <link href="css/style.css" rel="stylesheet" />
        {/* responsive style */}
        <link href="css/responsive.css" rel="stylesheet" />
        <div className="hero_area">
          {/* header section strats */}
          <header className="header_section">
            <div className="container-fluid">
              <nav className="navbar navbar-expand-lg custom_nav-container">
                <a className="navbar-brand" href="index.html">
                  <img src="images/logo.png" alt="" />
                  <span>
                    ANUMAAN
                  </span>
                </a>
                
                
              </nav>
            </div>
          </header>
          {/* end header section */}
          {/* slider section */}
          <section className="slider_section ">
            {/* <div class="carousel_btn-container">
        <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
          <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
          <span class="sr-only">Next</span>
        </a>
      </div> */}
            <div id="carouselExampleIndicators" className="carousel slide" data-ride="carousel">
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <div className="container-fluid">
                    <div className="row">
                      <div className="col-md-5 offset-md-1">
                        <div className="detail-box">
                          <h1>
                            Welcome to <br />
                            Anumaan <br />    
                          </h1>


                          
                          
                              
                          {/* <p>
                            Provide us Feedback with an online Test.
                          </p> */}
                          <div className="btn-box">
                            <a href="#findtest" className="btn-2">
                              Find a Test
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="offset-md-1 col-md-4 img-container">
                        <div className="img-box">
                          <img src="images/slider-img.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* end slider section */}
        </div>
        {/* experience section */}
        <section className="experience_section layout_padding">
          <div id="findtest" className="container">
            <div className="row">
              <div className="col-md-5">
                <div className="img-box">
                  <img src="images/experience-img.jpg" alt="" />
                </div>
              </div>
              <div  className="col-md-7">
                <div className="detail-box">
                  <div className="heading_container">
                    <h2>
                      Find a Test
                    </h2>
                  </div>
                  <p>
                    Give yourself an adrenaline dose with our online test. We have a wide range of tests to choose from. After the test provide us with feedbacks and get yourself some credit experience
                  </p>
                  <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select Institution
                    </option>
                    <option value="IIITD">IIITD</option>
                    <option value="Other">Other</option>
                  </select>

                  {institution === "IIITD" && (
                    <>
                      <input
                        type="text"
                        placeholder="Batch"
                        value={batch}
                        onChange={(e) => setBatch(e.target.value)}
                        required
                      />
                        <input
                      type="text"
                      placeholder="Branch"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      required
                    />
                      <input
                        type="text"
                        placeholder="Roll No"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                            required
                          />
                        </>
                      )}

                      {institution === "Other" && (
                        <input
                          type="text"
                          placeholder="Ref ID"
                          value={refID}
                          onChange={(e) => setRefID(e.target.value)}
                          required
                        />
                      )}

                        <input
                          type="tel"
                          placeholder="Mobile Number"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          required
                        />
                        
                        <div classname="inline spinner">
                          <h5> Please Provide with correct RefID/RollNo  </h5>
                          {loading && 
                            <div className="spinner "></div>}
                        </div>
                        
                    <div className="btn-box">
                      {error && <p className="error-message">{error}</p>}
                      <button type="submit" className="btn-1">Start Test</button>
                      {/* <button className="btn-1" >Read more</button> */}
                    </div> 
                  </form>
                  
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* end experience section */}
        {/* category section */}
        <section className="category_section layout_padding">
          {/* <div class="container">
      <div class="heading_container">
        <h2>
          Category
        </h2>
      </div>
      <div class="category_container">
        <div class="box">
          <div class="img-box">
            <img src="images/c1.png" alt="">
          </div>
          <div class="detail-box">
            <h5>
              Design & Arts
            </h5>
          </div>
        </div>
        <div class="box">
          <div class="img-box">
            <img src="images/c2.png" alt="">
          </div>
          <div class="detail-box">
            <h5>
              Web Development
            </h5>
          </div>
        </div>
        <div class="box">
          <div class="img-box">
            <img src="images/c3.png" alt="">
          </div>
          <div class="detail-box">
            <h5>
              SEO Markting
            </h5>
          </div>
        </div>
        <div class="box">
          <div class="img-box">
            <img src="images/c4.png" alt="">
          </div>
          <div class="detail-box">
            <h5>
              Video Edting
            </h5>
          </div>
        </div>
        <div class="box">
          <div class="img-box">
            <img src="images/c5.png" alt="">
          </div>
          <div class="detail-box">
            <h5>
              Logo Design
            </h5>
          </div>
        </div>
        <div class="box">
          <div class="img-box">
            <img src="images/c6.png" alt="">
          </div>
          <div class="detail-box">
            <h5>
              Game Design
            </h5>
          </div>
        </div>
      </div>
    </div> */}
        </section>
        {/* end category section */}
        {/* about section */}
        <section className="about_section layout_padding">
          <div className="container">
            <div className="row">
              <div className="col-md-10 col-lg-9 mx-auto">
                <div className="img-box">
                  <img src="images/about-img.jpg" alt="" />
                </div>
              </div>
            </div>
            <div className="detail-box">
              <h2>
                About Us
              </h2>
              {/* <p>
                This site is a BTP project being done under the guidance of Dr. Pragma Kar (IIITD) . Aim of this project is to provide a platform where students can give online tests and provide feedbacks. The feedbacks will be used to help us detect if you guessed or not.
              </p> */}
              <a href>
                Read More
              </a>
            </div>
          </div>
        </section>
        {/* end about section */}
        {/* client section */}
        {/* 
  <section class="client_section layout_padding">
    <div class="container">
      <div class="row">
        <div class="col-lg-9 col-md-10 mx-auto">
          <div class="heading_container">
            <h2>
              Testimonial
            </h2>
          </div>
          <div id="carouselExampleControls" class="carousel slide" data-ride="carousel">
            <div class="carousel-inner">
              <div class="carousel-item active">
                <div class="detail-box">
                  <h4>
                    John Hissona
                  </h4>
                  <p>
                    passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If youThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in s
                  </p>
                  <img src="images/quote.png" alt="">
                </div>
              </div>
              <div class="carousel-item">
                <div class="detail-box">
                  <h4>
                    John Hissona
                  </h4>
                  <p>
                    passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If youThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in s
                  </p>
                  <img src="images/quote.png" alt="">
                </div>
              </div>
              <div class="carousel-item">
                <div class="detail-box">
                  <h4>
                    John Hissona
                  </h4>
                  <p>
                    passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If youThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in s
                  </p>
                  <img src="images/quote.png" alt="">
                </div>
              </div>
            </div>
            <a class="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">
              <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">
              <span class="sr-only">Next</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section> */}
        {/* end client section */}
        {/* info section */}
        {/* <section className="info_section ">
          <div className="info_container layout_padding-top">
            <div className="container">
              <div className="info_top">
                <div className="info_logo">
                  <img src="images/logo.png" alt="" />
                  <span>
                    Anumaan
                  </span>
                </div>
              </div>
              <div className="info_main">
                <div className="row">
                  <div className="col-md-3 col-lg-2 offset-lg-1">
                    <h5>
                      Information
                    </h5>
                    <p>
                      Readable content of a page when looking at its layoutreadable content of a page when looking at its layout
                    </p>
                  </div>
                  <div class="col-md-3  offset-lg-1">
              <div class="info_form ">
                <h5>
                  
                </h5>
                <form action="">
                  <input type="email" placeholder="Email">
                  <button>
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-9 col-md-10 mx-auto">
                  <div className="info_contact layout_padding2">
                    <div className="row">
                      <div className="col-md-3">
                        <a href="#" className="link-box">
                          <div className="img-box">
                            <img src="images/location.png" alt="" />
                          </div>
                          <div className="detail-box">
                            <h6>
                              Delhi
                            </h6>
                          </div>
                        </a>
                      </div>
                      <div className="col-md-4">
                        <a href="#" className="link-box">
                          <div className="img-box">
                            <img src="images/mail.png" alt="" />
                          </div>
                          <div className="detail-box">
                            <h6>
                              Gng@gmail.com
                            </h6>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}
        {/* end info section */}
        {/* footer section */}
        <footer className="container-fluid footer_section ">
          <div className="container">
            <p>
              © <span id="displayDate" /> All Rights Reserved By IIITD
            </p>
          </div>
        </footer>
        {/* end  footer section */}
      </div>
    );
  }

  export default Index;