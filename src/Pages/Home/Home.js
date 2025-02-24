
import "./home.css";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { addTransaction, getTransactions } from "../../utils/ApiRequest";
import Spinner from "../../components/Spinner";
import TableData from "./TableData";
import Analytics from "./Analytics";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form, Container, InputGroup } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BarChartIcon from "@mui/icons-material/BarChart";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const Home = () => {
  const navigate = useNavigate();
  const [cUser, setcUser] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [frequency, setFrequency] = useState("7");
  const [type, setType] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [view, setView] = useState("table");
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  useEffect(() => {
    const avatarFunc = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return navigate("/login");
      if (!user.isAvatarImageSet || !user.avatarImage) navigate("/setAvatar");
      setcUser(user);
      setRefresh(true);
    };
    avatarFunc();
  }, [navigate]);

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(values).some((v) => v === "")) {
      return toast.error("Please enter all fields");
    }
    setLoading(true);
    try {
      const { data } = await axios.post(addTransaction, { ...values, userId: cUser._id });
      data.success ? toast.success(data.message) : toast.error(data.message);
      setShow(false);
      setRefresh(!refresh);
    } catch (err) {
      toast.error("Error, please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!cUser) return;
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { data } = await axios.post(getTransactions, {
          userId: cUser._id,
          frequency,
          startDate,
          endDate,
          type,
        });
        setTransactions(data.transactions);
      } catch (err) {
        toast.error("Error fetching transactions");
      }
      setLoading(false);
    };
    fetchTransactions();
  }, [refresh, frequency, startDate, endDate, type, cUser]);

  return (
    <>
      <Header />
      {loading && <Spinner />} 
      <Container className="mt-3">
        <Button onClick={() => setShow(true)} className="addNew">Add New</Button>
        <Modal show={show} onHide={() => setShow(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Add Transaction</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control name="title" value={values.title} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <InputGroup>
                  <Form.Control name="amount" type={showPassword ? "text" : "number"} value={values.amount} onChange={handleChange} />
                  <Button variant="outline-secondary" onClick={togglePassword}>
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </Button>
                </InputGroup>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select name="category" value={values.category} onChange={handleChange}>
                  <option value="">Choose...</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Rent">Rent</option>
                  <option value="Salary">Salary</option>
                  <option value="Food">Food</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control name="description" value={values.description} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control name="date" type="date" value={values.date} onChange={handleChange} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
            <Button variant="primary" onClick={handleSubmit}>Submit</Button>
          </Modal.Footer>
        </Modal>
        {view === "table" ? <TableData data={transactions} /> : <Analytics transactions={transactions} />}
        <ToastContainer />
      </Container>
    </>
  );
};

export default Home;
