from collections import defaultdict

def findDominance(s):
    m=len(s[0])
    result = []

    for length in range(1, m + 1):
        prefix_counts = {}
        max_dominance = 0

        # Count occurrences of each prefix of the current length
        for string in s:
            if length <= len(string):
                prefix = string[:length]
                if prefix in prefix_counts:
                    prefix_counts[prefix] += 1
                else:
                    prefix_counts[prefix] = 1
                # Update max dominance for the current length
                max_dominance = max(max_dominance, prefix_counts[prefix])

        # Store the maximum dominance for this prefix length
        result.append(max_dominance)
    
    return result


def getMinPrice(price):
    n = len(price)
    min_cost = float('inf')
    left = 0
    freq = {}
    current_cost = 0
    duplicates = 0  # To track the count of duplicate prices in the current window

    for right in range(n):
        # Add the current price to the cost and frequency dictionary
        current_cost += price[right]
        if price[right] in freq:
            freq[price[right]] += 1
            if freq[price[right]] == 2:  # We have a duplicate
                duplicates += 1
        else:
            freq[price[right]] = 1

        # While the window contains duplicates, check and try to shrink from the left
        while duplicates > 0:
            # Update min_cost if this window has duplicates and is cheaper
            min_cost = min(min_cost, current_cost)
            
            # Move the left pointer to shrink the window
            current_cost -= price[left]
            freq[price[left]] -= 1
            if freq[price[left]] == 1:  # Removed a duplicate
                duplicates -= 1
            elif freq[price[left]] == 0:
                del freq[price[left]]
            left += 1

    # Return the result, if min_cost was updated
    return min_cost if min_cost != float('inf') else -1

print(getMinPrice([1,2,1,2])) 
