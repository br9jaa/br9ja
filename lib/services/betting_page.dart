import 'package:flutter/material.dart';

class BettingPage extends StatefulWidget {
  const BettingPage({super.key});

  @override
  State<BettingPage> createState() => _BettingPageState();
}

class _BettingPageState extends State<BettingPage> {
  String? selectedBookie;
  final List<String> bookies = [
    'SportyBet',
    'Bet9ja',
    '1xBet',
    'MSport',
    'BetKing',
    '22Bet',
  ];
  final List<int> quickAmounts = [500, 1000, 2000, 5000];

  @override
  Widget build(BuildContext context) {
    const Color deepNavy = Color(0xFF001B3D);
    const Color digitalBlue = Color(0xFF0056D2);
    const Color neonMint = Color(0xFF00FFC2);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          "Bet Wallet Funding",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Select Bookmaker",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 15),

            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 2.5,
              ),
              itemCount: bookies.length,
              itemBuilder: (context, index) {
                bool isSelected = selectedBookie == bookies[index];
                return GestureDetector(
                  onTap: () => setState(() => selectedBookie = bookies[index]),
                  child: Container(
                    decoration: BoxDecoration(
                      color: isSelected ? deepNavy : Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isSelected ? neonMint : Colors.black12,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        bookies[index],
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.black,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),

            const SizedBox(height: 30),
            _field("User ID / Profile ID", Icons.person_search_rounded),
            const SizedBox(height: 25),

            const Text(
              "Quick Amount",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: quickAmounts.map((amt) {
                return ActionChip(
                  label: Text("₦$amt"),
                  onPressed: () {},
                  backgroundColor: Colors.white,
                );
              }).toList(),
            ),

            const SizedBox(height: 20),
            _field(
              "Custom Amount (₦)",
              Icons.account_balance_wallet,
              type: TextInputType.number,
            ),

            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: digitalBlue,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                ),
                onPressed: () {},
                child: const Text(
                  "Fund Account",
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _field(
    String hint,
    IconData icon, {
    TextInputType type = TextInputType.text,
  }) {
    return TextField(
      keyboardType: type,
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: Icon(icon, color: const Color(0xFF001B3D)),
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }
}
