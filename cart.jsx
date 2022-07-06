// simulate getting products from DataBase
const products = [
  { name: "Avocados", country: "Mexico", cost: 5, instock: 5 },
  { name: "Oranges", country: "Spain", cost: 3, instock: 3 },
  { name: "Apples", country: "France", cost: 3, instock: 4 },
  { name: "Corn", country: "USA", cost: 2, instock: 8 },
];

const useDataApi = (initialUrl, initialData) => {
  console.log(`useDataApi called`);

  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const photos = [
    "https://cdn.pixabay.com/photo/2018/04/17/20/35/food-3328649_960_720.jpg",
    "orange.png",
    "apple.png",
    "https://cdn.pixabay.com/photo/2018/09/26/21/24/corn-3705687_960_720.jpg",
    "https://cdn.pixabay.com/photo/2012/02/23/09/16/coffee-15994_960_720.jpg",
  ];
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const { Card, Accordion, Button, Container, Row, Col, Image, Input } =
    ReactBootstrap;
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);

  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    // Subtract 'In stock' by 1 if greater than 0
    if (item[0].instock == 0) return;
    console.log(item, item[0]);
    item[0].instock = item[0].instock - 1;
    console.log(`add to Cart ${JSON.stringify(item)}`);

    setCart([...cart, ...item]);
  };

  const deleteCartItem = (index) => {
    let newCart = cart.filter((item, i) => index != i);
    setCart(newCart);
  };

  // Product Items List
  let list = items.map((item, index) => {
    //let n = index + 1049;
    //let url = "https://picsum.photos/id/" + n + "/50/50";
    console.log("item: ", item);

    return (
      <li key={index}>
        <Image src={photos[index % 5]} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {item.name}:{item.cost} -{" "}
          {item.instock > 0 ? item.instock : "OUT OF STOCK"}
        </Button>
        <input name={item.name} type="submit" onClick={addToCart}></input>
      </li>
    );
  });

  // Cart Items List
  let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            {item.name}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          onClick={() => deleteCartItem(index)}
          eventKey={1 + index}
        >
          <Card.Body>
            $ {item.cost} from {item.country}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    console.log("finalList");

    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    console.log("checkOut");

    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };

  const restockProducts = (url) => {
    console.log("restockProducts");
    const realData = data.data;
    console.log("realData", realData);
    let newItems = realData.map((item) => {
      let { name, country, cost, instock } = item.attributes;
      return { name, country, cost, instock };
    });
    console.log("newItems", newItems);
    setItems([...newItems]);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion defaultActiveKey="0">{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`http://localhost:1337/api/${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
