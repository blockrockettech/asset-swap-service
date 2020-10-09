export interface AuthenticationChallenge {
    text: string;
    client_unpredictable_number: string;
    unpredictable_number: string;
    client_ip: string;
    issued_at: number;
    expires_at: number;
    signing_identity: string;
    issuer_signature: string;
}

export interface AuthenticationSuccess {
    jwt: string;
    exp: string;
}

export interface ChannelDefinition {
    channel_uuid: string;
    definition_version: string;
    channel_rating_id: string;
    zone_address: string;
    owner_address: string;
    deposit_address: string;
    validator_address: string;
    sender_address_list: string[];
    initial_state_hash: string;
    signature_list: string[]; //List of signatures on this channel definition.  A valid channel definition is signed by the channel owner and twice by the Kchannels backend.
}

export interface Transaction {
    request_uuid: string; //Hyphenated UUID of the transaction (36 characters)
    reference_data: string;
    value_list: TransactionValue[];
    sender_party: TransactionParty;
    recipient_party: TransactionParty;
    signature_list: string[];
    metadata: TransactionMetadata;
}

export interface TransactionValue {
    smart_contract: string;
    value: string;
    kind: string;
}

export interface ChannelAsset {
    smart_contract: string;
    value: string;
}

export interface ChannelInfo {
    channel_state: string;
    channel_state_hash: string;
    channel_status: string;
}

export interface ChannelState {
    nonce: string;
    channel_asset_list: ChannelAsset[];
}

export interface Client {
    client_address: string;
    first_name: string;
    last_name: string;
    email: string;
}

export interface ClientInfo {
    client: Client;
    channel_definition: ChannelDefinition;
    zone_location: ZoneLocation;
}

export interface TransactionInfo {
    transaction: Transaction;
    transaction_status: string;
}

export interface TransactionMetadata {
    request_uuid: string;
    channel_uuid: string;
    definition_version: string;
    reversal_nonce: string;
    external_tx_reference_list: string[];
    signature_list: string[];
}

export interface TransactionParty {
    nonce: string;
    state_hash: string;
    timestamp: string;
    channel_definition: ChannelDefinition;
    fee_list: TransactionValue[];
    summary: TransactionSummary;
}

export interface TransactionSummary {
    request_uuid: string;
    channel_uuid: string;
    definition_version: string;
    client_signer_address: string;
    zone_signer_address: string;
    final_state_hash: string;
    external_tx_reference: string;
    recipient_address: string;
    peer_last_seen_state_hash: string;
    timestamp: string;
    value_list: TransactionValue[];
    signature_list: string; //List of signatures (sender, sender's zone, recipient's zone)
}

export interface ZoneLocation {
    zone_address: string;
    zone_public_key: string;
    zone_client_endpoint: string;
}
