
import bcrypt from 'bcrypt';

const createHashValue = async (val) => {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hashSync(val, salt);
  };
  
  const isValidPasswd = async (psw, encryptedPsw) => {
    return await bcrypt.compareSync(psw, encryptedPsw);
  };
  

  export {  createHashValue,  isValidPasswd }