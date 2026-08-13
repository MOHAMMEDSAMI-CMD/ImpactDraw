import React, {useEffect, useState} from "react";
import api from "../api/api.js";

const ProfileSettings = () => {

const [charities,setCharities] = useState([]);
const [charity,setCharity] = useState("");
const [percentage,setPercentage] = useState(10);


const loadCharities = async()=>{

try{

const {data}=await api.get(
"/api/charities"
);

setCharities(data);

}catch(error){
console.log(error);
}

};



const saveProfile = async()=>{

try{

const {data}=await api.patch(
"/api/profile",
{
charity,
charityPercentage:percentage
}
);


alert(
"Profile updated successfully"
);


}catch(error){

console.log(
error.response?.data
);

}

};



useEffect(()=>{

loadCharities();

},[]);



return (

<div className="p-6">


<h1 className="text-3xl font-bold mb-6">
Profile Settings
</h1>


<div className="bg-white p-6 rounded shadow">


<label>
Select Charity
</label>


<select

value={charity}

onChange={(e)=>
setCharity(e.target.value)
}

className="border p-2 w-full mb-5"

>


<option value="">
Choose Charity
</option>


{
charities.map((item)=>(

<option
key={item._id}
value={item._id}
>

{item.name}

</option>

))

}


</select>




<label>
Donation Percentage
</label>


<input

type="number"

value={percentage}

onChange={(e)=>
setPercentage(e.target.value)
}

className="border p-2 w-full"

/>



<button

onClick={saveProfile}

className="bg-blue-600 text-white px-5 py-2 mt-5 rounded"

>

Save Changes

</button>



</div>


</div>

);

};


export default ProfileSettings;