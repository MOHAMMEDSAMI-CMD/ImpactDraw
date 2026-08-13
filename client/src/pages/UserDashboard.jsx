import React, { useEffect, useState } from "react";
import api from "../services/api";

const UserDashboard = () => {

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);


  const loadDashboard = async () => {

    try {

      const { data } =
        await api.get(
          "/api/profile/dashboard"
        );


      setDashboard(
        data.dashboard
      );


    } catch(error){

      console.log(
        "Dashboard error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };



  useEffect(()=>{

    loadDashboard();

  },[]);



  if(loading){

    return (
      <h1 className="p-6">
        Loading...
      </h1>
    );

  }



  if(!dashboard){

    return (
      <h1 className="p-6">
        No data found
      </h1>
    );

  }



  return (

    <div className="p-6 bg-gray-100 min-h-screen">


      <h1 className="text-3xl font-bold mb-6">
        Welcome {dashboard.user.name} 👋
      </h1>



      {/* Statistics */}

      <div className="grid md:grid-cols-4 gap-5">


        <div className="bg-white p-5 rounded shadow">

          <h3>
            Subscription
          </h3>

          <p className="text-green-600 font-bold">
            {dashboard.subscription.status}
          </p>

        </div>



        <div className="bg-white p-5 rounded shadow">

          <h3>
            Draws Entered
          </h3>

          <p className="text-2xl font-bold">
            {dashboard.statistics.drawsEntered}
          </p>

        </div>




        <div className="bg-white p-5 rounded shadow">

          <h3>
            Total Wins
          </h3>

          <p className="text-2xl font-bold">
            {dashboard.statistics.totalWins}
          </p>

        </div>




        <div className="bg-white p-5 rounded shadow">

          <h3>
            Prize Money
          </h3>

          <p className="text-2xl font-bold">
            ₹{dashboard.statistics.totalPrizeMoney}
          </p>

        </div>


      </div>


      {/* Latest Winner */}


      <div className="mt-8 bg-white p-6 rounded shadow">


        <h2 className="text-2xl font-bold mb-4">
          Winning History
        </h2>



        {
          dashboard.winners.map(
            (winner)=>(


            <div
             key={winner._id}
             className="border p-4 rounded mb-4"
            >


              <p>
                Draw:
                {" "}
                {winner.draw.month}
                {" "}
                {winner.draw.year}
              </p>


              <p>
                Numbers:
                {" "}
                {
                  winner.draw.numbers.join(
                    " "
                  )
                }
              </p>



              <p>
                Match:
                {" "}
                {winner.matchType}
              </p>



              <p>
                Prize:
                {" "}
                ₹{winner.prize}
              </p>



              <p>
                Status:
                {" "}
                {winner.payoutStatus}
              </p>


            </div>


          ))
        }



      </div>


    </div>

  );

};


export default UserDashboard;