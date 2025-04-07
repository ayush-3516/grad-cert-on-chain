
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract GradCertNFT is ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private _nextTokenId;
    
    struct Certificate {
        string documentHash;
        string studentId;
        uint256 issueDate;
        bool revoked;
    }
    
    mapping(uint256 => Certificate) private _certificates;
    
    constructor() ERC721("GraduateCertificate", "GRADCERT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function safeMint(
        address to,
        string memory studentId,
        string memory documentHash,
        string memory filebaseURI
    ) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        _safeMint(to, tokenId);
        _certificates[tokenId] = Certificate({
            documentHash: documentHash,
            studentId: studentId,
            issueDate: block.timestamp,
            revoked: false
        });
        
        _setTokenURI(tokenId, filebaseURI);
    }

    function revokeCertificate(uint256 tokenId) public onlyRole(MINTER_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        _certificates[tokenId].revoked = true;
    }

    function getCertificateData(uint256 tokenId) public view returns (
        string memory studentId,
        string memory documentHash,
        uint256 issueDate,
        bool revoked
    ) {
        require(_exists(tokenId), "Token does not exist");
        Certificate memory cert = _certificates[tokenId];
        return (
            cert.studentId,
            cert.documentHash,
            cert.issueDate,
            cert.revoked
        );
    }

    // Override required since we're using ERC721URIStorage
    function tokenURI(uint256 tokenId) public view override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    // Prevent token transfers (Soulbound NFTs)
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        require(auth == address(0) || to == address(0), "Certificates cannot be transferred");
        return super._update(to, tokenId, auth);
    }

    // Required override for AccessControl
    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
