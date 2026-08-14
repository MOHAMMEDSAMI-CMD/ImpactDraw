import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminWinners = () => {

  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(false);


  const token = localStorage.getItem("token");


  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });



  // ===============================
  // GET WINNERS
  // ===============================

  const fetchWinners = async () => {

    try {

      setLoading(true);

      const res = await api.get(
        "/admin/winners"
      );


      if(res.data.success){

        setWinners(
          res.data.winners
        );

      }


    } catch(error){

      console.log(
        "Load winners error",
        error
      );

    } finally {

      setLoading(false);

    }

  };



  useEffect(()=>{

    fetchWinners();

  },[]);



  // ===============================
  // APPROVE WINNER
  // ===============================

  const approveWinner = async(id)=>{

    try{


      const res = await api.patch(
        `/admin/winners/${id}/approve`
      );


      console.log(
        res.data
      );


      fetchWinners();


    }
    catch(error){

      console.log(
        "Approve error",
        error.response?.data ||
        error.message
      );

    }

  };



  // ===============================
  // REJECT WINNER
  // ===============================


  const rejectWinner = async(id)=>{

    try{


      const res = await api.patch(
        `/admin/winners/${id}/reject`
      );


      console.log(
        res.data
      );


      fetchWinners();


    }
    catch(error){

      console.log(
        "Reject error",
        error.response?.data ||
        error.message
      );

    }

  };




  // ===============================
  // MARK PAID
  // ===============================


  const markPaid = async(id)=>{

    try{


      const res = await api.patch(
        `/admin/winners/${id}/pay`
      );


      console.log(
        res.data
      );


      fetchWinners();


    }
    catch(error){

      console.log(
        "Payout error",
        error.response?.data ||
        error.message
      );

    }

  };




  return (

    <div className="p-6">


      <div className="flex justify-between mb-6">

        <h1 className="text-2xl font-bold">
          Winners
        </h1>


        <button
          onClick={fetchWinners}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Refresh
        </button>


      </div>



      {
        loading ?

        <p>
          Loading...
        </p>

        :

        winners.length===0 ?

        <p>
          No winners found
        </p>


        :


        winners.map((winner)=>(
          

          <div
            key={winner._id}
            className="border rounded-lg p-5 mb-5 shadow"
          >


            <h2 className="text-xl font-semibold">
              {
                winner.user?.name
              }
            </h2>


            <p>
              Email :
              {
                winner.user?.email
              }
            </p>


            <p>
              Prize :
              ₹{winner.prize}
            </p>


            <p>
              Match :
              {
                winner.matchType
              }
            </p>



            <p>
              Verification :
              <b>
                {
                  winner.verificationStatus
                }
              </b>
            </p>



            <p>
              Payout :
              <b>
                {
                  winner.payoutStatus
                }
              </b>
            </p>



            <div className="flex gap-3 mt-4">


              {
                winner.verificationStatus !== "approved"
                &&
                <button

                  onClick={()=>
                    approveWinner(
                      winner._id
                    )
                  }

                  className="bg-green-600 text-white px-4 py-2 rounded"

                >
                  Approve
                </button>
              }



              {
                winner.verificationStatus !== "rejected"
                &&
                <button

                  onClick={()=>
                    rejectWinner(
                      winner._id
                    )
                  }

                  className="bg-red-600 text-white px-4 py-2 rounded"

                >
                  Reject
                </button>
              }



              {
                winner.verificationStatus==="approved"
                &&
                winner.payoutStatus!=="paid"
                &&

                <button

                  onClick={()=>
                    markPaid(
                      winner._id
                    )
                  }

                  className="bg-purple-600 text-white px-4 py-2 rounded"

                >
                  Mark As Paid
                </button>

              }



            </div>



          </div>


        ))

      }



    </div>

  );

};


export default AdminWinners;