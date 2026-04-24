import "../styles/List.scss";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setListings } from "../redux/state";
import Loader from "./Loader";
import ListingCard from "./ListingCard";
import Footer from "../components/Footer"
import { getApiUrl } from "../lib/api";

const CategoryPage = () => {
  const [loading, setLoading] = useState(true);
  const { category } = useParams();

  const dispatch = useDispatch()
  const listings = useSelector((state) => state.listings);

  const getFeedListings = async () => {
    try {
      const response = await fetch(
        getApiUrl(`/properties?category=${category}`),
        {
          method: "GET",
        }
      )

      const data = await response.json()
      dispatch(setListings({ listings: data}));
      setLoading(false);
    }catch(err){
      console.log("Fetch Listings Failed", err.message);
    }
  }

  useEffect(() => {
    getFeedListings();
  }, [category])
  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">{category} listings</h1>
      <div className="list">
        {listings?.map(
          ({
            _id,
            creator,
            listingPhotoPaths,
            city,
            province,
            country,
            category,
            type,
            price,
            booking = false,
          }) => (
            <ListingCard
              listingId={_id}
              creator={creator}
              listingPhotoPaths={listingPhotoPaths}
              city={city}
              province={province}
              country={country}
              category={category}
              type={type}
              price={price}
              booking={booking}
            />
          )
        )}
      </div>
      <Footer />
    </>
  );
};

export default CategoryPage;
