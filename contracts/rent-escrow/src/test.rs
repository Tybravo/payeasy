#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);

    let landlord = Address::generate(&env);
    let total_amount = 1000_i128;
    let mut roommate_shares: Map<Address, i128> = Map::new(&env);
    roommate_shares.set(Address::generate(&env), 500);
    roommate_shares.set(Address::generate(&env), 500);

    env.mock_all_auths();
    client.initialize(&landlord, &total_amount, &roommate_shares);

    env.as_contract(&contract_id, || {
        let escrow: RentEscrow = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow)
            .expect("escrow should be stored after initialize");

        assert_eq!(escrow.landlord, landlord);
    });
}
